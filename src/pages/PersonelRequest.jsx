import  { useCallback, useState ,useEffect} from 'react';
import './css/PersonelRequest.css'; // CSS dosyasını içe aktar

export default function PersonelRequest() {
  
    const [selectedOption, setSelectedOption] = useState('İzin talebi');
    const handleChange = (event) => {
      setSelectedOption(event.target.value);
     }
  return (
    <div className='container'>
      <form action="http://localhost:5173/flow" method="get">
        <h3>Talep Formu</h3>
        <select className='dropdown' value={selectedOption} onChange={handleChange}>
          <option value="İzin Talebi">İzin Talebi</option>
          <option value="Eğitim Talebi">Eğitim Talebi</option>
          <option value="Avans Talebi">Avans Talebi</option>
          <option value="Harcama Talebi">Harcama Talebi</option>
        </select>
        
        <textarea className='text-area' placeholder='Lütfen Talebinizi Belirtiniz'></textarea>
        
        <button> Kaydet ve Gönder</button>
      </form>
    </div>
  );
  }