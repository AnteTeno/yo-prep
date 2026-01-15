import { useState, useEffect } from "react";
import "./App.css";

function App() {
    const [questions, setQuestions] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userAnswer, setUserAnswer] = useState('')
    const [feedback, setFeedback] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      fetch('http://localhost:8080/api/questions')
        .then(response => response.json())
        .then(data => {
          setQuestions(data)
          setLoading(false)
        })
        .catch(error => {
          console.error('Virhe:', error)
          setLoading(false)
        })
    }, [])

    const checkAnswer = () => {
      const correct = questions[currentIndex].correctAnswer
      if (userAnswer.trim().toLowerCase() === correct.toLowerCase()) {
        setFeedback('✅ Oikein!')
      } else {
        setFeedback(`❌ Väärin. Oikea vastaus: ${correct}`)
      }
    }

    const nextQuestion = () => {
      setCurrentIndex((currentIndex + 1) % questions.length)
      setUserAnswer('')
      setFeedback('')
    }

    if (loading) return <p>Ladataan...</p>
    if (questions.length === 0) return <p>Ei kysymyksiä.</p>

    const question = questions[currentIndex]

    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Yoprep</h1>

        <div style={{ marginBottom: '20px' }}>
          <span>Kysymys {currentIndex + 1} / {questions.length}</span>
          <span style={{ marginLeft: '20px' }}>Aine: {question.subject}</span>
          <span style={{ marginLeft: '20px' }}>Pisteet: {question.points}</span>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#333' }}>{question.questionText}</h2>
        </div>

        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Kirjoita vastaus..."
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            marginBottom: '10px'
          }}
        />

        <div>
          <button onClick={checkAnswer} style={{ marginRight: '10px', padding: '10px 20px' }}>
            Tarkista
          </button>
          <button onClick={nextQuestion} style={{ padding: '10px 20px' }}>
            Seuraava
          </button>
        </div>

        {feedback && (
          <p style={{ marginTop: '20px', fontSize: '18px' }}>{feedback}</p>
        )}
      </div>
    )
  }

export default App;
