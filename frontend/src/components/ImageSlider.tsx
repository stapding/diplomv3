import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
const slides = [{
  url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
  title: 'Профессиональная помощь',
  description: 'Забота о ваших любимых питомцах'
}, {
  url: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
  title: 'Надёжная клиника',
  description: 'Делаем каждое посещение комфортным'
}, {
  url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
  title: 'Современные удобства',
  description: 'Современное оборудование и уход'
}, {
  url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
  title: 'Команда профессионалов',
  description: 'Опытные профессионалы, которые любят свою работу'
}, {
  url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80',
  title: 'Счастливые питомцы',
  description: "Здоровье вашего питомца — наш приоритет"
}];
const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };
  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  useEffect(() => {
    const timer = setInterval(goToNext, 5000); // Auto-advance every 5 seconds
    return () => clearInterval(timer);
  }, [currentIndex]);
  return <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-lg">
      {/* Main Image */}
      <div className="w-full h-full bg-cover bg-center duration-500 ease-out transition-all" style={{
      backgroundImage: `url(${slides[currentIndex].url})`
    }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40">
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">
              {slides[currentIndex].title}
            </h2>
            <p className="text-lg">{slides[currentIndex].description}</p>
          </div>
        </div>
      </div>
      {/* Navigation Arrows */}
      <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all">
        <ChevronLeft size={24} />
      </button>
      <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all">
        <ChevronRight size={24} />
      </button>
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`} />)}
      </div>
    </div>;
};
export default ImageSlider;