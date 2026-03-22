import { Box, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';
import { useState } from 'react';

export default function Guidance() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock delay for prototype
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAnswer('IRD guidance answer will appear here. The RAG system is not yet integrated.');
    setIsLoading(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        IRD Tax Guidance
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Ask questions about New Zealand tax rules and get answers grounded in official IRD documentation.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Ask a tax question"
          placeholder="e.g., How do I report cryptocurrency gains?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!question.trim() || isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Ask Question'}
        </Button>
      </Box>

      {answer && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Answer
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {answer}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}