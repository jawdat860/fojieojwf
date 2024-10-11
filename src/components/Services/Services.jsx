import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ServiceCard from "./ServiceCard";
import axios from "axios";
import ServiceModal from "./ServiceModal";
import { Spinner } from "@telegram-apps/telegram-ui";
import FooterFlex from "../FooterFlex/FooterFlex";
import Example from "../Example";
import CategorySlider from "./CategorySlider";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeService, setActiveService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get('category') || 'All';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("https://menuapp.ru/api/v1");
        setServices(response.data);
        const allCategories = [
          ...new Set(response.data.map(service => service.category)),
        ];
        setCategories(allCategories);
        setLoading(false);
      } catch (err) {
        setError("Failed to load services.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory !== 'All') {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCardClick = (service) => {
    setActiveService(service);
    setIsModalOpen(true);
  };

  const servicesByCategory = services.reduce((acc, service) => {
    (acc[service.category] = acc[service.category] || []).push(service);
    return acc;
  }, {});

  const scrollToCategory = (category) => {
    setActiveCategory(category); // Update the active category state
    const element = document.getElementById(category);
    if (element) {
      const offset = 45; // Adjust the offset as needed
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="rounded-t-[40px] relative z-[11] mt-[-31px] bg-[#eee]">
      <Example />
      <div className="container relative jawdat">
        <div className="flex items-center top-[0px] h-16 sticky inset-x-0 z-[5] bg-[#eee] rounded-b-[20px]">
          <CategorySlider
            categories={categories} 
            scrollToCategory={scrollToCategory} 
            activeCategory={activeCategory} 
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[100%]">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-4 p-4 pb-[100px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative">
            {Object.entries(servicesByCategory).map(([category, services]) => (
              <div key={services.id} id={category} className="category-section">
                <h1 className="text-lg text-center my-[20px] font-bold">{category}</h1>
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => handleCardClick(service)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        <ServiceModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          service={activeService}
          selectedCategory={selectedCategory}
        />
        
        <FooterFlex />
      </div>
    </div>
  );
};

export default Services;
