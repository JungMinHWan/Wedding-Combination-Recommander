import React, { useState, useEffect } from 'react';
import { getRecommendations } from './services/sdmService';
import { Sparkles, Filter, ChevronDown, Heart } from 'lucide-react';
import AdminUpload from './components/AdminUpload';
import logoImg from './assets/logo.png';
import './App.css';

function App() {
  const [budgetOffset, setBudgetOffset] = useState(3000000); // 300만원 기본값
  const [selectedMood, setSelectedMood] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const moods = [
    { value: 'romantic', label: '로맨틱', desc: '사랑스럽고 화사한 분위기' },
    { value: 'modern', label: '모던', desc: '세련되고 도시적인 분위기' },
    { value: 'classic', label: '클래식', desc: '시간이 지나도 우아한 정석' },
    { value: 'vintage', label: '빈티지', desc: '필름 감성의 따뜻한 무드' }
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    // 인위적인 지연 효과로 프리미엄한 처리 과정을 연출
    setTimeout(async () => {
      const results = await getRecommendations(budgetOffset, selectedMood);
      setRecommendations(results);
      setIsLoading(false);
    }, 800);
  };

  // 초기에도 한 번 검색 및 로우팅 감지
  useEffect(() => {
    handleSearch();

    const handleHashChange = () => {
      setIsAdmin(window.location.hash === '#admin');
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="container header-content">
          <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logoImg} alt="요즘웨딩" style={{ height: '32px' }} />
          </div>
          <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            상담 예약
          </button>
        </div>
      </header>

      <main className="main-content">
        {isAdmin ? (
          <AdminUpload />
        ) : (
          <>
            {/* Hero Section */}
        <section className="hero-section" style={{
          padding: '80px 0 40px',
          textAlign: 'center',
          animation: 'fadeIn 1s ease-out'
        }}>
          <div className="container">
            <h1 style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--primary-dark)' }}>
              나만의 완벽한 웨딩 무드
            </h1>
            <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              예산과 원하시는 분위기만 알려주세요. Lumina가 당신을 위한 최적의 스튜디오, 드레스, 메이크업 피스를 큐레이션 해드립니다.
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="filter-section container" style={{ 
          maxWidth: '800px', 
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-lg)',
          marginTop: '32px',
          marginBottom: '48px',
          transform: 'translateY(-20px)'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={20} /> 예산 설정
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>최대 예산</span>
              <span style={{ fontWeight: '600', color: 'var(--primary-dark)', fontSize: '1.2rem' }}>
                {formatPrice(budgetOffset)}
              </span>
            </div>
            <input 
              type="range" 
              min="1500000" 
              max="6000000" 
              step="100000" 
              value={budgetOffset} 
              onChange={(e) => setBudgetOffset(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-dark)' }}
            />
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} /> 분위기 선택
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              {moods.map(mood => (
                <div 
                  key={mood.value}
                  className={`btn-outline ${selectedMood === mood.value ? 'active' : ''}`}
                  style={{ 
                    padding: '16px', 
                    borderRadius: '16px', 
                    cursor: 'pointer',
                    textAlign: 'center',
                    border: `2px solid ${selectedMood === mood.value ? 'var(--primary-color)' : 'var(--border-color)'}` ,
                    transition: 'var(--transition)'
                  }}
                  onClick={() => setSelectedMood(mood.value)}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{mood.label}</div>
                  <div style={{ fontSize: '0.8rem', color: selectedMood === mood.value ? '#eee' : 'var(--text-light)' }}>
                    {mood.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? '고객님을 위한 조합을 찾는 중입니다...' : '스드메 매칭 시작하기'}
          </button>
        </section>

        {/* Results Section */}
        <section className="results-section container animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2rem' }}>추천 조합</h2>
          <p className="text-muted text-center" style={{ marginBottom: '40px' }}>
            {recommendations.length > 0 
              ? `예산에 맞는 총 ${recommendations.length}개의 프리미엄 조합을 찾았습니다.`
              : '현재 조건에 맞는 조합이 없습니다. 조건을 조금 완화해 보세요.'}
          </p>

          <div style={{ display: 'grid', gap: '32px' }}>
            {recommendations.map((rec, index) => (
              <div key={rec.id} className="recommendation-card" style={{
                backgroundColor: '#fff',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards`,
                opacity: 0,
                transform: 'translateY(20px)'
              }}>
                {/* Header of Card */}
                <div style={{ 
                  padding: '24px', 
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-light)'
                }}>
                  <div>
                    <span style={{ 
                      backgroundColor: 'var(--primary-color)', 
                      color: 'white', 
                      padding: '4px 12px', 
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      letterSpacing: '1px'
                    }}>
                      {rec.mood.toUpperCase()}
                    </span>
                    <h3 style={{ marginTop: '8px', fontSize: '1.4rem' }}>Lumina Signature #{index + 1}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>패키지 총액</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-dark)' }}>
                      {formatPrice(rec.totalPrice)}
                    </div>
                  </div>
                </div>

                {/* Items Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1px', backgroundColor: 'var(--border-color)' }}>
                  {[
                    { label: 'Studio', item: rec.studio },
                    { label: 'Dress', item: rec.dress },
                    { label: 'Makeup', item: rec.makeup }
                  ].map((part) => (
                    <div key={part.label} style={{ backgroundColor: 'white', position: 'relative' }}>
                      <div style={{
                        height: '240px',
                        backgroundImage: `url(${part.item.image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '16px',
                          left: '16px',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          backdropFilter: 'blur(4px)'
                        }}>
                          {part.label}
                        </div>
                      </div>
                      <div style={{ padding: '20px' }}>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>
                          {part.item.name}
                        </div>
                        <p className="text-muted" style={{ marginBottom: '12px', minHeight: '40px' }}>
                          {part.item.description}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>
                            {formatPrice(part.item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
          </>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2026 Lumina Wedding. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
