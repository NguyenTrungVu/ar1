
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './layout/Footer';
import Header from './layout/Header';
import Home from './components/Home';
import ImageDetec from './components/ImageDetect ';
import ImageDetecting from './components/ImageDetecting';
import Upload from './components/Upload';
import Earth from './layout/earth';
function App() {
  return (
    <BrowserRouter>
      <Header/>
      
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/imagedetection" element={<ImageDetecting/>}/>
        <Route path="/planedetection" element={<ImageDetec/>}/>
        <Route path="/upload" element={<Upload/>}/>
      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}

export default App;
