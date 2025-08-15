import './App.css'
import Router from './router/index'
import Navbar from './components/navbar'
function App() {

  return(
    
     <div className='bg-grren-400 w-full'>
      <Navbar/>
        <Router   />
     </div>

  )
}

export default App
