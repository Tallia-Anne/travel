import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import TravelStoryCard from "../../components/Cards/TravelStoryCard";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";


// notisfication

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddEditTravelStory from "./AddEditTravelStory";
import ViewTravelStory from "./ViewTravelStory";
import EmptyCard from "../../components/Cards/EmptyCard";
import { DayPicker } from "react-day-picker";
import moment from "moment";
import FilterInfoTitle from "../../components/Cards/FilterInfoTitle";
import { getEmptyCardImg, getEmptyCardMessage } from "../../utils/helper";

const Home = () => {
  const navigate = useNavigate();



  const [userInfo, setUserInfo] = useState(null); 
  const [allStories, setAllStories] = useState([]); 
  
  const [openAddEditModal,setOpenAddEditModal] = useState({

  isShow: false,
  type: 'add',
  data: null,
})

  const [openViewModal,setOpenViewModal] = useState({

  isShow: false,
  data: null,
})


const [searchQuery, setSearchQuery] = useState('');
const [filterType,setFilterType] = useState('');


 const [dateRange, setDateRange] = useState({form:null, to:null});

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');

      if (response.data && response.data.user) {
        setUserInfo(response.data.user); // Utilisation correcte de setUserInfo
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };


// Afficher les stories


const getAllTravel = async () => {

try {
  
 const response = await axiosInstance.get('/get-all-stories');

      if (response.data && response.data.stories) {
        setAllStories(response.data.stories); // Utilisation correcte de setUserInfo
      }

} catch (error) {
  console.log("An unexpected error occurred. Please try again")
}

}

const handleEdit = (data) => {

setOpenAddEditModal({  isShow: true, type: "edit" , data: data });

}
// Ouvrir un modal view
const handleViewStory = (data) => {

setOpenViewModal({ isShow: true , data })

}

// Mettre a jour le favorite
const updateIsFavourite = async (storyData)=> {

const storyId = storyData._id;

try {

 const response = await axiosInstance.put('/update-is-favourite/' + storyId, {

isFavourite: !storyData.isFavourite,

});
 if (response.data && response.data.story) {
      toast.success("L'histoire est était mis en favorie");

      if (filterType === "search" && searchQuery) {
        onSearchStory(searchQuery);
      } else if (filterType === "date") {
      filterStoriesByDate(dateRange);
} else {

       getAllTravel() }// Utilisation correcte de setUserInfo
      }

  
} catch (error) {
   console.log("An unexpected error occurred. Please try again")
}


}
// Supprimer le story
const deleteTravelStory = async (data) => {
  const storyId = data._id;

  try {
    const response = await axiosInstance.delete("/delete-story/" + storyId);

    // Vérifier si la réponse ne contient pas d'erreur
    if (!response.data.error) {
      toast.error("La story a été supprimée avec succès"); // Message de succès
      setOpenViewModal((prevState) => ({ ...prevState, isShow: false })); // Fermer la modal
      getAllTravel(); // Rafraîchir la liste des stories
    } else {
      // Si une erreur est présente dans la réponse
      toast.error("Une erreur s'est produite lors de la suppression de la story");
    }
  } catch (error) {
    // Gérer les erreurs de requête
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message); // Afficher le message d'erreur
    } else {
      toast.error("Une erreur inattendue s'est produite. Veuillez réessayer.");
    }
    console.error("Error deleting story:", error);
  }
}

// Barre de recherche
const onSearchStory =  async (query) => {

   try {
    const response = await axiosInstance.get("/search", {

    params: {
    query,
}

  } );
if (response.data && response.data.stories) {

  setFilterType("search");
  setAllStories(response.data.stories);
  
}
   
  } catch (error) {
   
    console.log("An error unexpected error occurred. Please try again");
  }

 };
// nettoyer la barre de recherche
const handleClearSearch = () => { 

setFilterType("");
getAllTravel();


};

const filterStoriesByDate = async (day) => {

try {

const startDate = day.from ? moment(day.from).valueOf() : null;
const endDate = day.to ? moment(day.to).valueOf() : null;

if (startDate && endDate) {
    const response = await axiosInstance.get("/travel-stories/filter", {
    params: {startDate, endDate}
});

  if (response.data && response.data.stories) {
    setFilterType("date");
    setAllStories(response.data.stories);
  }

}
  
} catch (error) {
  console.error("An unexpected error occurred. Please try again");
}


}

const handleDayClick = (date) => {
setDateRange(date);
filterStoriesByDate(date);
}

const resetFilter = () => {
setDateRange({from: null, to: null});
setFilterType("");
getAllTravel();
}


  useEffect(() => {
     getAllTravel();
    getUserInfo();
  }, []);




  return (
    <>
      <Navbar userInfo={userInfo}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onSearchNote={onSearchStory}
      handleClearSearch={handleClearSearch} /> {/* Passe userInfo correctement */}
      {/* {JSON.stringify(userInfo)} */}

      <div className="container mx-auto py-10">

      <FilterInfoTitle 
      filterType={filterType}
      filterDates={dateRange}
      onClear={() => { resetFilter(); }}
      />
        <div className="flex gap-7">
          <div className="flex-1 ">

          {

          allStories.length > 0 ? (

          <div className="grid grid-cols-2 gap-4 p-4">
          {
            allStories.map((item) => {

                  return (    

                  <TravelStoryCard 
                    key={item._id}
                    imgUrl ={item.imageUrl}
                    title = {item.title} 
                    story= {item.story}
                    date={item.visitedDate}
                    visitedLocation={item.visitedLocation}
                    isFavourite={item.isFavourite}
                    onEdit={() => handleEdit(item)}
                    onClick={() => handleViewStory(item)}  
                    onFavouriteClick={ () => updateIsFavourite(item)}  

/>

                );

            } )
          }

        </div>
            ) : (
            <EmptyCard
             imgSrc={getEmptyCardImg(filterType)} 
            message={getEmptyCardMessage(filterType)}
            />
          )

          }


          </div>
          <div className="w-[340px] pr-8">
              <div className="bg-white border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg">
            <div className="p-0">
              <DayPicker
                captionLayout="dropdown-buttons"
                mode="range"
                selected={dateRange}
                onSelect={handleDayClick}
                pageNavigation
                />
              </div>
              </div>
          </div>
        </div>
      </div>



      {/* Ajouter et modifier Travel Story Model */}

      <Modal 
      isOpen = {openAddEditModal.isShow}
      onRequestClose={() => {}}
      style={{ overlay: {
      backgroundColor: "rgba(0,0,0,0.2)",
      zIndex:999,
      }}}
      appElement={document.getElementById("root")}
      className="model-box" >


     <AddEditTravelStory
      type={openAddEditModal.type}
      storyInfo={openAddEditModal.data}
      onClose ={() => {
      setOpenAddEditModal({ isShow: false, type: "add", data:null });
      }}
      getAllTravel={getAllTravel}
        /> 

      </Modal>

       <Modal 
      isOpen = {openViewModal.isShow}
      onRequestClose={() => {}}
      style={{ overlay: {
      backgroundColor: "rgba(0,0,0,0.2)",
      zIndex:999,
      }}}
      appElement={document.getElementById("root")}
      className="model-box" >

      <ViewTravelStory
      storyInfo={openViewModal.data || null}
      onClose={() => { setOpenViewModal((prevState) => ({ ...prevState, isShow:false }) ); }} 
      onDeleteClick={() => { 
     deleteTravelStory(openViewModal.data || null);
    }}
       onEditClick={() => {
      setOpenViewModal((prevState) => ({ ...prevState, isShow:false }) );
      handleEdit(openViewModal.data || null);
    }} />

      </Modal>
    


      <button className="w-16 h-16 flex items-center justify-center rounded-full bg bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
      onClick={() => {
      setOpenAddEditModal({ isShow: true , type: "add" , data: null});
}}    
      >
      <MdAdd className="text-[32px] text-white"/>
      </button>

      <ToastContainer/>

    </>
  );
};

export default Home;
