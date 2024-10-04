import { DayPicker } from "react-day-picker";
import moment from "moment";
import { MdOutlineDateRange, MdClose } from "react-icons/md";
import { useState } from "react";

const DateSelector = ({ date, setDate }) => {
  const [openDatePicker, setOpenDatePicker] = useState(false);

  return (
    <div>
      {/* Bouton d'ouverture du sélecteur de date */}
      <button
        className="inline-flex items-center gap-3 text-[13px] font-medium text-sky-600 bg-sky-200/40 hover:bg-sky-200/70 rounded px-2 py-1 cursor-pointer"
        onClick={() => {
          setOpenDatePicker(true);
        }}
      >
        <MdOutlineDateRange className="text-lg" />
        {date ? moment(date).format("Do MMM YYYY") : moment().format("Do MMM YYYY")}
      </button>

      {/* Affichage du sélecteur de date si ouvert */}
      {openDatePicker && (
        <div className="overflow-y-scroll p-5 bg-sky-50/80 rounded-lg relative pt-9">
          {/* Bouton pour fermer le sélecteur de date */}
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-100 hover:bg-sky-100 absolute top-2 right-2"
            onClick={() => setOpenDatePicker(false)}
          >
            <MdClose className="text-xl text-sky-600" />
          </button>

          {/* Composant DayPicker */}
          <DayPicker
            captionLayout="dropdown-buttons"
            mode="single"
            selected={date}
            onSelect={setDate}  // Correction: passer setDate ici pour sélectionner une date
            pageNavigation
          />
        </div>
      )}
    </div>
  );
};

export default DateSelector;
