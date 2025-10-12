
'use client';


import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import Image from 'next/image';
import { useTranslation } from '../contexts/TranslationContext';
// import { GET_PRODUCTS } from '../graphql/queries';




const cards1 = [
  {
    image: '/assets/getafe.webp',
     title:'FOOTball'
  },
  {
    image: '/assets/getafe.webp',
     title:'FOOTball'

  },
{
    image: '/assets/getafe.webp',
    title:'FOOTball'
       
  },
];

export default function MultiSlider_4() {
 

  const { t , lang} = useTranslation();
  const sliderOptions = {
  
    type: 'loop',
    perPage: 4,
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
    <div className="w-full  mx-auto px-4 space-y-5 py-10">
    <div className="mx-auto text-2xl flex justify-center font-bold   text-white">{t("From the league to the national team - our gloves show off worldwide")}</div>

<Splide key={lang} className='h-fit' options={sliderOptions} aria-label="عروض مميزة">
        {cards1.map((item, index) => (
          <SplideSlide key={index}>
            <div className=" rounded-lg shadow-md overflow-hidden w-full flex flex-col h-96">
              <div className="relative w-full h-full    flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain w-80 "
                />
              </div>
             
            </div>
          </SplideSlide>
        ))}
      </Splide>

      <button className='flex justify-center font-bold p-5 cursor-pointer rounded-sm bg-green-600 text-black text-lg mx-auto mt-3'>{t("KEEPERSPORT PROS")}</button>

     
    </div>
  );
}
