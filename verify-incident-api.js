import axios from 'axios';

const API_URL = 'http://localhost:3001/api/analyze-incident';

const mockDebugData = {
    errorLog: 'ReferenceError: spark is not defined',
    symptoms: 'The application crashes when trying to generate a prompt.',
    environment: 'Windows 11, Node.js v20',
    codeSnippet: 'const prompt = spark.llmPrompt`...`',
    stackTrace: 'at Object.<anonymous> (e:\\production-readiness\\test.js:1:1)'
};

async function testIncidentAnalysis() {
    console.log('🧪 Testing Incident Analysis API...');
    console.log('URL:', API_URL);

    try {
        const response = await axios.post(API_URL, { debugData: mockDebugData });

        if (response.data && response.data.success) {
            console.log('✅ Success! proper JSON response received.');
            console.log('Analysis Result Summary:');
            console.log('Severity:', response.data.data.incidentReport?.severity);
            console.log('Error Type:', response.data.data.incidentReport?.errorType);

            // Basic validation of structure
            const report = response.data.data;
            if (report.incidentReport && report.rootCauseAnalysis && report.solution) {
                console.log('✅ Response structure is valid.');
            } else {
                console.error('❌ Response structure is invalid:', Object.keys(report));
            }

        } else {
            console.error('❌ Failed:', response.data);
        }
    } catch (error) {
        console.error('❌ API Request Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        process.exit(1);
    }
}

testIncidentAnalysis();
