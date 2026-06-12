import React from 'react'
import ButtonUI from './Components/ButtonUI'

function SubmitButtons() {
  const buttonData = [
    {
      label: "Referral",
      discription: "New referral slip",
      component: "referral",
    },
    {
      label: "TYFTB",
      discription: "New TYB slip",
      component: "tyftb",
    },
    {
      label: "M to M",
      discription: "New M2M slip",
      component: "m2m",
    },
    // {
    //   label: "Submit Visitor",
    //   discription: "Create new visitor slip",
    //   component: "visitors",
    // },
  ];

  const buttons = () => {
    return buttonData.map((button, i) => (
      <ButtonUI
        key={i}
        index={i}
        label={button.label}
        description={button.discription}
        component={button.component}
      />
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300 space-y-2.5">
      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.18em] px-1">Quick Submit</p>
      <div className="grid grid-cols-3 gap-2">
        {buttons()}
      </div>
    </div>
  );
}

export default SubmitButtons;