import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'https://ai-study-assistant-server-i9fd.onrender.com';

function Dashboard() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [flipped, setFlipped] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/');
  }, [navigate]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('pdf', file);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API}/api/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message);
      setDocumentId(res.data.documentId);
      setSummary(''); setFlashcards([]); setQuestions([]);
      setSelected({}); setSubmitted(false);
    } catch (err) {
      setMessage('Upload failed');
    }
  };

  const handleSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await axios.post(`${API}/api/summary/${documentId}`);
      setSummary(res.data.summary);
    } catch (err) { setSummary('Failed to generate summary'); }
    setLoadingSummary(false);
  };

  const handleFlashcards = async () => {
    setLoadingFlashcards(true);
    try {
      const res = await axios.post(`${API}/api/flashcards/${documentId}`);
      setFlashcards(res.data.flashcards);
      setFlipped({});
    } catch (err) { setFlashcards([]); }
    setLoadingFlashcards(false);
  };

  const handleQuiz = async () => {
    setLoadingQuiz(true); setSubmitted(false); setSelected({});
    try {
      const res = await axios.post(`${API}/api/quiz/${documentId}`);
      setQuestions(res.data.questions);
    } catch (err) { setQuestions([]); }
    setLoadingQuiz(false);
  };

  const handleSelect = (qIndex, option) => {
    if (!submitted) setSelected(prev => ({ ...prev, [qIndex]: option }));
  };

  const getScore = () => questions.filter((q, i) => selected[i] === q.answer).length;

  const toggleFlip = (i) => {
    setFlipped(prev => ({ ...prev, [i]: !prev[i] }));
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data.documents);
      setShowHistory(true);
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  const loadDocument = (docId) => {
    setDocumentId(docId);
    setSummary(''); setFlashcards([]); setQuestions([]);
    setSelected({}); setSubmitted(false);
    setShowHistory(false);
    setMessage('Document loaded from history!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fdf6ee', fontFamily: 'Georgia, serif' }}>
      <style>{`
        .flashcard-scene {
          perspective: 1000px;
          width: 100%;
          height: 200px;
          margin-top: 12px;
        }
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
          cursor: pointer;
        }
        .flashcard-inner.flipped {
          transform: rotateY(180deg);
        }
        .flashcard-front, .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 24px;
          box-sizing: border-box;
          text-align: center;
        }
        .flashcard-front {
          background: linear-gradient(135deg, #d97706, #f59e0b);
          color: white;
          border: 2px solid #b45309;
        }
        .flashcard-back {
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
          color: #92400e;
          border: 2px solid #fbbf24;
          transform: rotateY(180deg);
        }
        .warm-btn {
          background-color: #d97706;
          color: white;
          padding: 10px 24px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .warm-btn:hover { background-color: #b45309; }
        .warm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .warm-card {
          background-color: #fffaf4;
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(180, 83, 9, 0.08);
          padding: 28px;
          border: 1px solid #fde68a;
        }
        .warm-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #92400e;
          margin-bottom: 16px;
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        backgroundColor: '#92400e',
        color: 'white',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>📚 AI Study Assistant</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', opacity: 0.9 }}>Hi, {user?.name}!</span>
          <button onClick={fetchHistory} style={{
            backgroundColor: '#fef3c7',
            color: '#92400e',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '13px'
          }}>
            📋 History
          </button>
          <button onClick={handleLogout} style={{
            backgroundColor: '#fef3c7',
            color: '#92400e',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '13px'
          }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Upload */}
        <div className="warm-card">
          <h2 className="warm-section-title">📄 Upload a PDF</h2>
          <form onSubmit={handleUpload} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} required
              style={{ fontSize: '13px', color: '#78350f' }} />
            <button type="submit" className="warm-btn">Upload</button>
          </form>
          {message && <p style={{ marginTop: '12px', color: '#15803d', fontWeight: '600' }}>{message}</p>}
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="warm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="warm-section-title" style={{ margin: 0 }}>📋 Upload History</h2>
              <button onClick={() => setShowHistory(false)} style={{
                background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#92400e'
              }}>✕</button>
            </div>
            {history.length === 0 ? (
              <p style={{ color: '#78350f', fontSize: '14px' }}>No documents uploaded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.map((doc) => (
                  <div key={doc._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: '#fff7ed',
                    borderRadius: '10px',
                    border: '1px solid #fde68a'
                  }}>
                    <div>
                      <p style={{ fontWeight: '600', color: '#44403c', margin: 0, fontSize: '14px' }}>
                        📄 {doc.filename}
                      </p>
                      <p style={{ color: '#a16207', fontSize: '12px', margin: '4px 0 0 0' }}>
                        {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button onClick={() => loadDocument(doc._id)} style={{
                      backgroundColor: '#d97706',
                      color: 'white',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}>
                      Load
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {documentId && (
          <>
            {/* Summary */}
            <div className="warm-card">
              <h2 className="warm-section-title">🧠 Summary</h2>
              <button onClick={handleSummary} disabled={loadingSummary} className="warm-btn">
                {loadingSummary ? 'Generating...' : 'Generate Summary'}
              </button>
              {summary && (
                <ul style={{ marginTop: '16px', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {summary
                    .split('\n')
                    .filter(line => line.trim() !== '')
                    .map((line, i) => (
                      <li key={i} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '10px 14px',
                        backgroundColor: '#fff7ed',
                        borderRadius: '10px',
                        borderLeft: '4px solid #d97706'
                      }}>
                        <span style={{ color: '#d97706', fontWeight: 'bold', marginTop: '1px' }}>•</span>
                        <span style={{ color: '#44403c', lineHeight: '1.6', fontSize: '14px' }}>
                          {line.replace(/^[-•*]\s*/, '').trim()}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Flashcards */}
            <div className="warm-card">
              <h2 className="warm-section-title">🃏 Flashcards</h2>
              <button onClick={handleFlashcards} disabled={loadingFlashcards} className="warm-btn">
                {loadingFlashcards ? 'Generating...' : 'Generate Flashcards'}
              </button>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {flashcards.map((card, i) => (
                  <div key={i} className="flashcard-scene" onClick={() => toggleFlip(i)}>
                    <div className={`flashcard-inner ${flipped[i] ? 'flipped' : ''}`}>
                      <div className="flashcard-front">
                        <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85, marginBottom: '10px' }}>
                          Question
                        </p>
                        <p style={{ fontSize: '15px', fontWeight: '500', lineHeight: '1.5' }}>{card.question}</p>
                        <p style={{ fontSize: '11px', opacity: 0.75, marginTop: '12px' }}>👆 Click to flip</p>
                      </div>
                      <div className="flashcard-back">
                        <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '10px' }}>
                          Answer
                        </p>
                        <p style={{ fontSize: '15px', fontWeight: '500', lineHeight: '1.5' }}>{card.answer}</p>
                        <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '12px' }}>👆 Click to flip back</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz */}
            <div className="warm-card">
              <h2 className="warm-section-title">📝 Quiz</h2>
              <button onClick={handleQuiz} disabled={loadingQuiz} className="warm-btn">
                {loadingQuiz ? 'Generating...' : 'Generate Quiz'}
              </button>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {questions.map((q, i) => (
                  <div key={i}>
                    <p style={{ fontWeight: '600', color: '#44403c', marginBottom: '10px' }}>{i + 1}. {q.question}</p>
                    <div>
                      {q.options.map((option, j) => {
                        let bgColor = '#fffaf4';
                        let borderColor = '#fde68a';
                        if (submitted) {
                          if (option === q.answer) { bgColor = '#d1fae5'; borderColor = '#6ee7b7'; }
                          else if (option === selected[i]) { bgColor = '#fee2e2'; borderColor = '#fca5a5'; }
                        } else if (selected[i] === option) {
                          bgColor = '#fef3c7'; borderColor = '#d97706';
                        }
                        return (
                          <div
                            key={j}
                            onClick={() => handleSelect(i, option)}
                            style={{
                              cursor: submitted ? 'default' : 'pointer',
                              userSelect: 'none',
                              padding: '12px 16px',
                              marginBottom: '8px',
                              borderRadius: '10px',
                              border: `2px solid ${borderColor}`,
                              backgroundColor: bgColor,
                              color: '#44403c',
                              fontSize: '14px',
                              transition: 'all 0.2s'
                            }}
                          >
                            {option}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {questions.length > 0 && !submitted && (
                  <button
                    onClick={() => setSubmitted(true)}
                    disabled={Object.keys(selected).length !== questions.length}
                    style={{
                      backgroundColor: '#16a34a',
                      color: 'white',
                      padding: '10px 24px',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      cursor: Object.keys(selected).length !== questions.length ? 'not-allowed' : 'pointer',
                      opacity: Object.keys(selected).length !== questions.length ? 0.5 : 1,
                      fontSize: '14px'
                    }}>
                    Submit Quiz
                  </button>
                )}
                {submitted && (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    backgroundColor: '#fff7ed',
                    borderRadius: '16px',
                    border: '2px solid #fbbf24'
                  }}>
                    <p style={{ fontSize: '26px', fontWeight: '700', color: '#d97706' }}>
                      🎉 Score: {getScore()} / {questions.length}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;