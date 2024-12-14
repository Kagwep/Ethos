import { OpenAI } from 'openai';
import { DataFrame } from 'data-forge';
import { fileTypeFromBuffer } from 'file-type';
import { XMLParser } from 'fast-xml-parser';
import * as pdfjsLib from 'pdfjs-dist';


interface ContentAnalysisConfig {
    openaiApiKey: string;
    maxSizeBytes?: number;
}

interface AnalysisResponse {
    isValid: boolean;
    content?: any;
    insights?: string;
    warnings?: string[];
    error?: string;
}

interface FileValidationOptions {
    allowedMimeTypes: string[];
    maxSizeBytes: number;
}

export class ContentAnalysisAgent {
    private openai: OpenAI;
    private allowedMimeTypes: string[];
    private maxSizeBytes: number;

    constructor(config: ContentAnalysisConfig) {
        this.openai = new OpenAI({
            apiKey: config.openaiApiKey,
            dangerouslyAllowBrowser: true
        });
        this.maxSizeBytes = config.maxSizeBytes || 5 * 1024 * 1024; // 5MB default
        this.allowedMimeTypes = [
            'application/json',
            'text/csv',
            'text/plain',
            'application/pdf',
            'application/xml',
            'text/xml'
        ];
    }

    private async validateFile(file: File): Promise<boolean> {
        const options: FileValidationOptions = {
            allowedMimeTypes: this.allowedMimeTypes,
            maxSizeBytes: this.maxSizeBytes
        };

        if (file.size > options.maxSizeBytes) {
            throw new Error(`File size exceeds maximum limit of ${options.maxSizeBytes} bytes`);
        }

        const fileBuffer = await file.arrayBuffer();
        const fileType = await fileTypeFromBuffer(Buffer.from(fileBuffer) as any);

        if (fileType && !options.allowedMimeTypes.includes(fileType.mime)) {
            throw new Error(`File type ${fileType.mime} not allowed`);
        }

        return true;
    }

    private async readFileContent(file: File): Promise<any> {
        const buffer = await file.arrayBuffer();

        if (file.type === 'application/pdf') {
            const pdf = await pdfjsLib.getDocument(buffer).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map((item: any) => item.str).join(' ') + '\n';
            }
            return text;
        }

        const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });

        if (file.type === 'application/xml' || file.type === 'text/xml') {
            const parser = new XMLParser();
            return parser.parse(text);
        }

        if (file.type === 'application/json') {
            return JSON.parse(text);
        }

        return text;
    }

    private async checkSensitiveData(content: string): Promise<string[]> {
        const warnings: string[] = [];
        
        // Regular expressions for common sensitive data patterns
        const patterns = {
            apiKey: /(['"]?[a-zA-Z0-9_-]*api[_-]?key['"]?\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"])/i,
            accessKey: /(['"]?access[_-]?key['"]?\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"])/i,
            password: /(['"]?password['"]?\s*[:=]\s*['"][^'"]{8,}['"])/i,
            privateKey: /(-----BEGIN PRIVATE KEY-----[^-]+-----END PRIVATE KEY-----)/,
            email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
            phoneNumber: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
        };

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(content)) {
                warnings.push(`Potential ${type} detected in content`);
            }
        }

        return warnings;
    }

    public async analyzeContent(file: File): Promise<AnalysisResponse> {
        try {
            // Step 1: Validate file
            await this.validateFile(file);

            // Step 2: Read content
            const content = await this.readFileContent(file);

            // Step 3: Check for sensitive data
            const warnings = await this.checkSensitiveData(
                typeof content === 'string' ? content : JSON.stringify(content)
            );

            // Step 4: Analyze content with GPT
            const analysisPrompt = `Analyze this content for:
                1. Data quality issues
                2. Potential security concerns
                3. Personal or sensitive information
                4. Structural integrity
                5. Content validity


                CRITICAL Security Risks:
                - API keys or access tokens
                - Private keys or certificates
                - Passwords or secret keys
                These could lead to unauthorized access and security breaches.

                SENSITIVE Information:
                - Email addresses
                - IP addresses
                - Phone numbers
                This personal information could violate privacy regulations.

                If you find any critical issues, start your response with "CRITICAL:".
                For moderate issues, start with "WARNING:".
                For minor issues, start with "NOTICE:".

                Please provide a concise summary.`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: analysisPrompt },
                    { role: "user", content: typeof content === 'string' ? content : JSON.stringify(content, null, 2) }
                ],
                temperature: 0.5,
                max_tokens: 1000
            });

            const gptInsights = response.choices[0].message.content || "No insights generated";

            if (gptInsights.startsWith('CRITICAL:')) {
                return {
                    isValid: false,
                    content,
                    insights: gptInsights,
                    warnings: [...warnings, gptInsights],
                };
            }

            return {
                isValid: true,
                content,
                insights: response.choices[0].message.content || "No insights generated",
                warnings: warnings.length > 0 ? warnings : undefined
            };

        } catch (error) {
            return {
                isValid: false,
                error: `Analysis error: ${(error as Error).message}`
            };
        }
    }

    public async askFollowUp(
        previousAnalysis: string,
        question: string
    ): Promise<AnalysisResponse> {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a content analysis expert. A previous analysis was performed, and now you need to answer a follow-up question about it." },
                    { role: "assistant", content: previousAnalysis },
                    { role: "user", content: question }
                ],
                temperature: 0.5,
                max_tokens: 1000
            });

            return {
                isValid: true,
                insights: response.choices[0].message.content as any
            };

        } catch (error) {
            return {
                isValid: false,
                error: `Follow-up analysis error: ${(error as Error).message}`
            };
        }
    }
}