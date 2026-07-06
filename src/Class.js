// import React, { Children } from 'react'


// export default function App() {
//   return (
//     <div 
//         className='App' 
//         onClick={() => {
//         alert('You clicked me')
//     }}>

//     <Button 
//         onClick={() => alert('Playing!')}
//         children='Play Movie'
//     />
        
//     <Button 
//         onClick={() => alert('Uploading!')}
//         children={'Upload Image'}
//     />
      
//     </div>
//   )
// };
//  function Button ({onClick, children}){
// return(
//     <button onClick={e => {
//         e.stopPropagation();
//         onClick();
//     }}>
//         {children}
//     </button>
// )
// };


// export default function LightSwitch() {
//   function handleClick() {
//     let bodyStyle = document.body.style;
//     if (bodyStyle.backgroundColor === 'black') {
//       bodyStyle.backgroundColor = 'white';
//     } else {
//       bodyStyle.backgroundColor = 'black';
//     }
    
//   }

//   return (
//     <button onClick={handleClick}>
//       Toggle the lights
//     </button>
//   );
// }


// export default function ColorSwitch(){
//   function handleClick() {
//   let bgColor = document.body.style;
//   if (bodyStyle.bgColor === 'black'){
//     bodyStyle.bgColor = 'white';
//   }
// else {bodyStyle.bgColor = 'black'}
// }
//  {
//   return (
//     <button onClick={handleClick}>
//       Change color
//     </button>
//   );
  
// }

