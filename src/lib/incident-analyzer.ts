export interface IncidentDebugData {
    errorLog?: string
    symptoms: string
    environment: string
    codeSnippet?: string
    stackTrace?: string
}

export interface IncidentReport {
    incidentReport: {
        severity: string
        errorType: string
        confidenceScore: number
    }
    rootCauseAnalysis: {
        symptom: string
        directCause: string
        rootCause: string
        explanation: string
    }
    solution: {
        immediateFix: {
            code: string
            description: string
        }
        longTermMitigation: string
    }
    verificationSteps: string[]
    preventionStrategy: {
        action: string
        type: string
    }[]
    impactAnalysis: string
}

// API base URL - uses proxy server to secure API keys
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export async function analyzeIncident(debugData: IncidentDebugData): Promise<IncidentReport> {
    const endpoint = `${API_BASE_URL}/api/analyze-incident`

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ debugData }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data
}
