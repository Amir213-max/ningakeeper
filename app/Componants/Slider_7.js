
'use client';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import Image from 'next/image';
import { useTranslation } from '../contexts/TranslationContext';





const cards1 = [
  {
    title: 'Professionals trust KEEPERsport ',
    description: 'Rate your experience',
    image: '/assets/Trustpiolt.webp',
        price: '€34',
    price_ : '99',
     new:"NEW"
  },
  {
    title: 'Professionals trust KEEPERsport ',
    description: 'Rate your experience',
    image: '/assets/miss.webp',
        price: '€34',
    price_ : '99',
     new:"NEW"

  },
  {
    title: 'Professionals trust KEEPERsport ',
    description: 'Rate your experience',
    image: '/assets/gloveGuide.webp',
        price: '€34',
    price_ : '99',
    new:"NEW"
  }
  ,
  {
    title: 'Professionals trust KEEPERsport ',
    description: 'Rate your experience',
    image: '/assets/miss.webp',
        price: '€34',
    price_ : '99',
     new:"NEW"

  },

  {
      title: 'Professionals trust KEEPERsport ',
    description: 'Rate your experience',
    image: '/assets/Trustpiolt.webp',
        price: '€34',
        price_ : '99',
        new:"NEW"
    },
    {
      title: 'Professionals trust KEEPERsport ',
      description: 'Ball',
      image: '/assets/miss.webp',
          price: '€34',
      price_ : '99',
       new:"NEW"
    
    },
];

export default function MultiSlider_7() {
  
  const {t , lang } = useTranslation()
  const sliderOptions = {
  
    type: 'loop',
    perPage: 5,
    gap: '1rem',
    autoplay: true,
    interval: 3000,
    pauseOnHover: true,
    arrows: true,
    pagination: false,
    breakpoints: {
      1024: { perPage: 3 },
      640: { perPage: 2 },
    },
    direction : lang === 'ar' ? 'rtl' : 'ltr',
  };
  return (
    <div key={lang} className="w-full max-w-9xl mx-auto px-4 space-y-5 py-10">
    <div className="mx-auto text-2xl flex justify-center font-bold  text-white"> {t("The latest football boots for talents and professionals:")}</div>

      <Splide key={lang} className='h-fit' options={sliderOptions} aria-label="عروض مميزة">
        {cards1.map((item, index) => (
          <SplideSlide key={index}>
            <div className="bg-neutral-900 hover:bg-neutral-800  rounded-lg shadow-md overflow-hidden flex flex-col h-96">
              <div className="relative w-full h-60   flex items-center justify-center">
              <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover "
                />
              </div>
              <div className="p-5">
                
               
                <h3 className="text-xl border-b-2 border-b-gray-400 pb-4    font-bold mb-2">{t(`${item.description}`)}</h3>
                <p className="  text-base text-amber-300">{t(`${item.description}`)}</p>
               
              </div>
            </div>
          </SplideSlide>
        ))}
      </Splide>

     
    </div>
  );
}
