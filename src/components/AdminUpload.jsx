import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '../supabaseClient';
import { UploadCloud, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const AdminUpload = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = () => {
    if (!file) {
      setStatus('error');
      setMessage('선택된 파일이 없습니다.');
      return;
    }

    setStatus('processing');
    setMessage('파일을 파싱중입니다...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: async (results) => {
        const data = results.data;
        
        if (!data || data.length === 0) {
          setStatus('error');
          setMessage('파일에 유효한 데이터가 없습니다.');
          return;
        }

        // 필수 컬럼 검증
        const requiredColumns = ['id', 'category', 'name', 'price', 'mood'];
        const headers = Object.keys(data[0]);
        const missingColumns = requiredColumns.filter(c => !headers.includes(c));
        
        if (missingColumns.length > 0) {
          setStatus('error');
          setMessage(`CSV 파일 헤더에 다음 필수 컬럼이 누락되었습니다: ${missingColumns.join(', ')}`);
          return;
        }

        setMessage(`Supabase에 총 ${data.length}개의 데이터를 업데이트(Upsert)하는 중...`);
        
        try {
          // 일괄 업데이트(Upsert)
          // id가 있으면 덮어쓰고, 없으면 새로 추가하게 됩니다. (Supabase 기본동작)
          const { error } = await supabase
            .from('sdm_items')
            .upsert(data, { onConflict: 'id' });

          if (error) throw error;

          setStatus('success');
          setMessage(`성공적으로 ${data.length}개의 상품을 동기화했습니다!`);
        } catch (error) {
          setStatus('error');
          setMessage(`업로드 중 에러 발생: ${error.message || '알 수 없는 오류'}`);
        }
      },
      error: (error) => {
        setStatus('error');
        setMessage(`파일 파싱 중 에러 발생: ${error.message}`);
      }
    });
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '32px',
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <h2 style={{ marginBottom: '24px', fontSize: '1.8rem', color: 'var(--primary-dark)' }}>
        상품 데이터 업로드 관리자 (CSV)
      </h2>
      
      <p className="text-muted" style={{ marginBottom: '24px' }}>
        엑셀에서 내보내기한 .csv 파일을 선택해주세요. 기존 데이터는 유지되며, ID가 같은 항목은 새로운 내용으로 덮어씁니다(Upsert).
      </p>

      <div style={{
        border: '2px dashed var(--border-color)',
        borderRadius: '16px',
        padding: '40px 20px',
        textAlign: 'center',
        marginBottom: '24px',
        backgroundColor: 'var(--bg-light)'
      }}>
        <UploadCloud size={48} color="var(--primary-dark)" style={{ marginBottom: '16px' }} />
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange}
          style={{ display: 'block', margin: '0 auto' }} 
        />
        {file && <div style={{ marginTop: '16px', fontWeight: '600' }}>선택된 파일: {file.name}</div>}
      </div>

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}
        onClick={handleUpload}
        disabled={status === 'processing' || !file}
      >
        {status === 'processing' ? <RefreshCw className="animate-spin" /> : '업데이트 시작'}
      </button>

      {status !== 'idle' && (
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: status === 'success' ? '#eefbf3' : (status === 'error' ? '#fdefee' : '#f0f7ff'),
          color: status === 'success' ? '#1aa053' : (status === 'error' ? '#d93025' : '#2b5ea7')
        }}>
          {status === 'success' && <CheckCircle size={24} />}
          {status === 'error' && <AlertCircle size={24} />}
          {status === 'processing' && <RefreshCw size={24} className="animate-spin" />}
          <span>{message}</span>
        </div>
      )}
      
      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '32px 0' }} />
      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
        <strong>필수 헤더:</strong> id, category (studio/dress/makeup), name, price, mood <br/>
        <strong>선택 헤더:</strong> description, image_url
      </div>
    </div>
  );
};

export default AdminUpload;
