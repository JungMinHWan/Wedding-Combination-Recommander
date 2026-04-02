// src/services/sdmService.js
import { supabase } from '../supabaseClient';

const mockItems = [
  // Studios
  { id: 's1', category: 'studio', name: '그레이스 스튜디오 (Demo)', price: 1200000, mood: 'romantic', description: '자연 채광이 아름다운 로맨틱 무드', image_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800' },
  { id: 's2', category: 'studio', name: '모던 앤 시크 (Demo)', price: 1500000, mood: 'modern', description: '세련된 도시 감성의 모던 스튜디오', image_url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800' },
  { id: 's3', category: 'studio', name: '클래식 포트레이트 (Demo)', price: 1400000, mood: 'classic', description: '오래 보아도 질리지 않는 클래식함', image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800' },
  { id: 's4', category: 'studio', name: '빈티지 레코드 (Demo)', price: 900000, mood: 'vintage', description: '필름 감성의 따뜻한 빈티지 촬영', image_url: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=800' },

  // Dresses
  { id: 'd1', category: 'dress', name: '라 비앙 로즈 (Demo)', price: 800000, mood: 'romantic', description: '화려한 레이스와 풍성한 벨라인', image_url: 'https://images.unsplash.com/photo-1595015383921-2e8609503add?auto=format&fit=crop&q=80&w=800' },
  { id: 'd2', category: 'dress', name: '실크 하우스 (Demo)', price: 1200000, mood: 'modern', description: '군더더기 없는 미니멀한 실크 드레스', image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800' },
  { id: 'd3', category: 'dress', name: '헤리티지 웨딩 (Demo)', price: 1500000, mood: 'classic', description: '정통 웨딩의 정석, 비즈 장식 에이라인', image_url: 'https://images.unsplash.com/photo-1546804784-816671b05214?auto=format&fit=crop&q=80&w=800' },
  { id: 'd4', category: 'dress', name: '보헤미안 브라이드 (Demo)', price: 600000, mood: 'vintage', description: '자유로운 감성의 레이스 슬립 드레스', image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800' },

  // Makeups
  { id: 'm1', category: 'makeup', name: '블리스 뷰티 (Demo)', price: 350000, mood: 'romantic', description: '화사하고 러블리한 과즙상 메이크업', image_url: 'https://images.unsplash.com/photo-1516975080661-46bfa2c2f7b8?auto=format&fit=crop&q=80&w=800' },
  { id: 'm2', category: 'makeup', name: '어반 터치 (Demo)', price: 400000, mood: 'modern', description: '이목구비를 살리는 음영 메이크업', image_url: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800' },
  { id: 'm3', category: 'makeup', name: '루미나 (Demo)', price: 500000, mood: 'classic', description: '고급스러운 피부 표현과 우아한 색조', image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&q=80&w=800' },
  { id: 'm4', category: 'makeup', name: '아뜰리에 뮤즈 (Demo)', price: 300000, mood: 'vintage', description: '소프트한 코랄 브라운 톤업 메이크업', image_url: 'https://images.unsplash.com/photo-1512496015851-a1cba23932b4?auto=format&fit=crop&q=80&w=800' },
];

export const getRecommendations = async (budgetMax, mood) => {
  let items = [];

  try {
    // 실제 Supabase 환경에서 데이터 조회 
    const { data, error } = await supabase
      .from('sdm_items')
      .select('*');

    if (error) {
      console.warn("Supabase fetch error, using mock data:", error.message);
      items = mockItems;
    } else if (!data || data.length === 0) {
      console.warn("No data in Supabase, using mock data.");
      items = mockItems;
    } else {
      // 정상적으로 Supabase에서 데이터 로드됨
      items = data;
    }
  } catch (err) {
    console.warn("Caught error fetching DB, using mock data:", err);
    items = mockItems;
  }
  
  // 1. 분위기(mood) 기준으로 아이템 필터링 (선택된 mood가 없으면 전체 1순위)
  const filtered = mood 
    ? items.filter(item => item.mood === mood)
    : items;
    
  const studios = filtered.filter(i => i.category === 'studio');
  const dresses = filtered.filter(i => i.category === 'dress');
  const makeups = filtered.filter(i => i.category === 'makeup');
  
  const combinations = [];
  
  // 2. 스, 드, 메 조합 생성
  for (const s of studios) {
    for (const d of dresses) {
      for (const m of makeups) {
        const totalPrice = s.price + d.price + m.price;
        
        // 3. 예산 범위 확인
        if (totalPrice <= budgetMax) {
          combinations.push({
            id: `${s.id}-${d.id}-${m.id}`,
            totalPrice,
            studio: s,
            dress: d,
            makeup: m,
            mood: s.mood // 대표 무드
          });
        }
      }
    }
  }
  
  // 예산이 남는 순서대로 정렬 (BudgetMax에 가까운 순)
  return combinations.sort((a, b) => b.totalPrice - a.totalPrice);
};
