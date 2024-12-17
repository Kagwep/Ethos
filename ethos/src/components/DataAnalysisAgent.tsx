import { OpenAI } from 'openai';
import { DataFrame } from 'data-forge';

interface AnalysisResponse {
    insights: string;
    error?: string;
}

interface DataAnalysisAgentConfig {
    openaiApiKey: string;
}

interface AnalysisMetrics {
    shape: [number, number];
    columns: string[];
    dataTypes: Record<string, string>;
    basicStats: Record<string, any>;
    missingValues: Record<string, number>;
}

export class DataAnalysisAgent {
    private openai: OpenAI;
    
    constructor(config: DataAnalysisAgentConfig) {
        this.openai = new OpenAI({
            apiKey: config.openaiApiKey,
            dangerouslyAllowBrowser: true
        });
    }

    private async getDataMetrics(df: DataFrame): Promise<AnalysisMetrics> {
        const shape: [number, number] = [df.count(), df.getColumnNames().length];
        const columns = df.getColumnNames();
        
        const dataTypes: Record<string, string> = {};
        const basicStats: Record<string, any> = {};
        const missingValues: Record<string, number> = {};

        columns.forEach(col => {
            const series = df.getSeries(col);
            const firstValue = series.first();
            dataTypes[col] = typeof firstValue;

            if (typeof firstValue === 'number') {
                const values = series.toArray();
                basicStats[col] = {
                    mean: values.reduce((a, b) => a + b, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                };
            }

            missingValues[col] = series.where(v => v === null || v === undefined).count();
        });

        return {
            shape,
            columns,
            dataTypes,
            basicStats,
            missingValues
        };
    }

    public async analyzeData(
        jsonData: any,
        specificQuestions?: string[]
    ): Promise<AnalysisResponse> {
        try {

            const jsonString = JSON.stringify(jsonData, null, 2);

 
            let prompt = `You are a data analysis expert. Please analyze the following data and provide insights.
            Focus on:
            1. Key patterns and trends
            2. Notable statistics
            3. Potential anomalies
            4. Interesting relationships between variables
            5. Actionable insights
            6. Data quality issues (missing values, outliers)`;

            if (specificQuestions?.length) {
                prompt += "\n\nPlease also address these specific questions:\n";
                specificQuestions.forEach((q, i) => {
                    prompt += `${i + 1}. ${q}\n`;
                });
            }

            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: prompt },
                    { role: "user", content: jsonString }
                ],
                temperature: 0.5,
                max_tokens: 2000
            });

            return {
                insights: response.choices[0].message.content || "No insights generated"
            };

        } catch (error) {
            return {
                insights: "",
                error: `Analysis error: ${( error as any).message}`
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
                    { role: "system", content: "You are a data analysis expert. A previous analysis was performed, and now you need to answer a follow-up question about it." },
                    { role: "assistant", content: previousAnalysis },
                    { role: "user", content: question }
                ],
                temperature: 0.5,
                max_tokens: 1000
            });

            return {
                insights: response.choices[0].message.content || "No insights generated"
            };

        } catch (error) {
            return {
                insights: "",
                error: `Follow-up analysis error: ${( error as any).message}`
            };
        }
    }
}