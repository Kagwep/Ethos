import { OpenAI } from 'openai';

interface DataInsightsConfig {
  openaiApiKey: string;
}

interface InsightsResponse {
  insights?: string;
  error?: string;
  details?: {
    summary: string;
    keyPoints: string[];
    recommendations?: string[];
    risks?: string[];
  };
}

export class DataInsightsAgent {
  private openai: OpenAI;

  constructor(config: DataInsightsConfig) {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
      dangerouslyAllowBrowser: true
    });
  }

  public async analyzeData(content: string): Promise<InsightsResponse> {
    try {
      const analysisPrompt = `As a data analysis expert, analyze the following content. 
      Provide insights in the following format:
      
      SUMMARY: A brief overview of the data and its key characteristics
      
      KEY FINDINGS:
      - List important patterns, trends, or notable aspects
      - Highlight significant correlations or relationships
      - Note any data quality issues or anomalies
      
      RECOMMENDATIONS: (if applicable)
      - Actionable suggestions based on the analysis
      - Areas for further investigation
      
      RISKS: (if detected)
      - Data quality concerns
      - Potential biases or limitations
      - Security or privacy considerations
      
      Format your response starting each section with the headers above.
      Be concise but thorough. Include numerical evidence where relevant.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: analysisPrompt },
          { role: "user",   content: typeof content === 'string' ? content : JSON.stringify(content, null, 2) }
        ],
        temperature: 0.5,
        max_tokens: 1000
      });

      const analysisText = response.choices[0].message.content || '';
      
      // Parse the structured response
      const sections = this.parseAnalysisResponse(analysisText);

      return {
        insights: analysisText,
        details: {
          summary: sections.summary,
          keyPoints: sections.keyFindings,
          recommendations: sections.recommendations,
          risks: sections.risks
        }
      };

    } catch (error) {
      return {
        error: `Analysis failed: ${(error as Error).message}`
      };
    }
  }

  public async askFollowUp(
    previousAnalysis: string,
    question: string
  ): Promise<InsightsResponse> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are a data analysis expert. Answer the follow-up question based on the previous analysis. Be specific and reference relevant data points." 
          },
          { role: "assistant", content: previousAnalysis },
          { role: "user", content: question }
          
        ],
        temperature: 0.5,
        max_tokens: 1000
      });

      return {
        insights: response.choices[0].message.content as any
      };

    } catch (error) {
      return {
        error: `Follow-up analysis failed: ${(error as Error).message}`
      };
    }
  }

  private parseAnalysisResponse(text: string): {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    risks: string[];
  } {
    const sections = {
      summary: '',
      keyFindings: [] as string[],
      recommendations: [] as string[],
      risks: [] as string[]
    };

    // Split by sections and parse
    const lines = text.split('\n');
    let currentSection: keyof typeof sections | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('SUMMARY:')) {
        currentSection = 'summary';
        sections.summary = trimmedLine.replace('SUMMARY:', '').trim();
      } else if (trimmedLine.startsWith('KEY FINDINGS:')) {
        currentSection = 'keyFindings';
      } else if (trimmedLine.startsWith('RECOMMENDATIONS:')) {
        currentSection = 'recommendations';
      } else if (trimmedLine.startsWith('RISKS:')) {
        currentSection = 'risks';
      } else if (trimmedLine.startsWith('- ') && currentSection) {
        if (currentSection !== 'summary') {
          sections[currentSection].push(trimmedLine.replace('- ', ''));
        }
      } else if (trimmedLine && currentSection === 'summary') {
        sections.summary += ' ' + trimmedLine;
      }
    }

    return sections;
  }
}