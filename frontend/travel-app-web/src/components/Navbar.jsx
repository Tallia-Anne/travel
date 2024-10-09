import { useNavigate } from 'react-router-dom';
import LOGO from '../assets/images/world-wide-travel.svg';
import ProfileInfo from './Cards/ProfileInfo';
import SearchBar from './Input/SearchBar';
import {FaHeart } from 'react-icons/fa6';

const Navbar = ( {userInfo, searchQuery, setSearchQuery, onSearchNote, handleClearSearch} ) => {
  const isToken = localStorage.getItem('token');
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate('/login');
  };


  const handleSearch  = () => {
  if (searchQuery) {
    onSearchNote(searchQuery);
  }
};

  const onClearSearch = () => {
  handleClearSearch();
  setSearchQuery("");
};

  return (
    <div className='bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10'>
      <img src={LOGO} alt='travel story' className='h-9' />
      
      {isToken && userInfo && ( // Assure-toi que userInfo existe avant de l'utiliser
       <> 
        <SearchBar 
        value={searchQuery}
        onChange={({target}) => {
        setSearchQuery(target.value);
        } }
      handleSearch={handleSearch}
      onClearSearch={onClearSearch}
      />
      <div className='w-[140px] flex items-center justify-center gap-2'>
       <FaHeart className='text-cyan-900'/>
        <ProfileInfo   userInfo={userInfo} onLogout={onLogout} />
      </div>
         
 </>
      
      )}
    
    </div>
  );
};

export default Navbar;
