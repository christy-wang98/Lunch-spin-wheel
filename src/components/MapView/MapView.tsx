import React, { useEffect, useRef, useState } from 'react';
import { WheelOption } from '../../types/wheelOption';
import { 
  initMap, 
  MapInstance, 
  getCurrentLocation, 
  searchNearbyRestaurants, 
  Restaurant,
  filterRestaurants
} from '../../utils/mapService';
import styles from './MapView.module.css';
import { useTranslation } from 'react-i18next';
import { SpinWheelItem } from '../../types/restaurant';

interface MapViewProps {
  onAddRestaurants: (restaurants: WheelOption[]) => void;
}

const MapView: React.FC<MapViewProps> = ({ onAddRestaurants }) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapInstance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    position: [number, number];
    address: string;
  } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>([]);
  const [searchRadius, setSearchRadius] = useState<number>(1000);
  const [searchKeyword, setSearchKeyword] = useState<string>('restaurant');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [radiusCircle, setRadiusCircle] = useState<google.maps.Circle | null>(null);
  const [diningMode, setDiningMode] = useState<'all' | 'dineIn' | 'delivery'>('all');

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapLoaded) return;

    const initializeMap = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Initializing map...');
        const mapContainerId = 'map-container';
        const instance = await initMap(mapContainerId);
        setMapInstance(instance);
        setMapLoaded(true);
        
        // Get current location
        try {
          console.log('Getting current location...');
          const location = await getCurrentLocation(instance);
          console.log('Location received:', location);
          setCurrentLocation(location);
          
          // Add initial radius circle
          const circle = new google.maps.Circle({
            map: instance.map,
            center: { lat: location.position[1], lng: location.position[0] },
            radius: searchRadius,
            strokeColor: '#2196F3',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#2196F3',
            fillOpacity: 0.1
          });
          setRadiusCircle(circle);
          
          // Search nearby restaurants
          console.log('Searching nearby restaurants...');
          const nearbyRestaurants = await searchNearbyRestaurants(
            instance,
            location.position,
            searchRadius,
            searchKeyword
          );
          console.log('Found restaurants:', nearbyRestaurants);
          setRestaurants(nearbyRestaurants);
        } catch (locationError: any) {
          console.error('Location error:', locationError);
          if (locationError.message.includes('permission')) {
            setError('Please allow location access in your browser settings and refresh the page');
          } else if (locationError.message.includes('unavailable')) {
            setError('Location information unavailable. Please check if location services are enabled');
          } else if (locationError.message.includes('timeout')) {
            setError('Location request timed out. Please check your connection and refresh the page');
          } else {
            setError(`Unable to get location: ${locationError.message}`);
          }
        }
        
        setLoading(false);
      } catch (mapError: any) {
        console.error('Map initialization error:', mapError);
        setError(`Map loading failed: ${mapError.message}`);
        setLoading(false);
      }
    };

    initializeMap();
  }, [mapLoaded, searchRadius, searchKeyword]);

  // Filter restaurants by dining mode
  const filterRestaurantsByMode = (restaurants: Restaurant[]) => {
    switch (diningMode) {
      case 'dineIn':
        return restaurants.filter(r => r.hasDineIn);
      case 'delivery':
        return restaurants.filter(r => r.hasDelivery);
      default:
        return restaurants;
    }
  };

  // Handle search results
  const handleSearch = async () => {
    if (!mapInstance || !currentLocation) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const nearbyRestaurants = await searchNearbyRestaurants(
        mapInstance,
        currentLocation.position,
        searchRadius,
        searchKeyword
      );
      
      const filteredRestaurants = filterRestaurantsByMode(nearbyRestaurants);
      setRestaurants(filteredRestaurants);
      setLoading(false);
    } catch (searchError) {
      console.error('Restaurant search failed:', searchError);
      setError('Restaurant search failed. Please try again later');
      setLoading(false);
    }
  };

  // Add restaurant to selection list
  const handleSelectRestaurant = (restaurant: Restaurant) => {
    if (selectedRestaurants.some(r => r.id === restaurant.id)) {
      // If already selected, unselect it
      setSelectedRestaurants(selectedRestaurants.filter(r => r.id !== restaurant.id));
    } else {
      // If not selected, add to selection list
      setSelectedRestaurants([...selectedRestaurants, restaurant]);
    }
  };

  // Add selected restaurants to wheel options
  const handleAddToWheel = () => {
    if (selectedRestaurants.length === 0) {
      setError('Please select at least one restaurant');
      return;
    }

    // Convert restaurants to wheel option format
    const wheelOptions: WheelOption[] = selectedRestaurants.map(restaurant => ({
      id: restaurant.id,
      label: restaurant.name,
      color: getRandomColor(), // Randomly assign color
      weight: 1,
      // Add additional information
      metadata: {
        address: restaurant.address,
        distance: restaurant.distance,
        location: restaurant.location,
        category: restaurant.category,
        rating: restaurant.rating
      }
    }));

    // Callback to add to wheel
    onAddRestaurants(wheelOptions);
    
    // Clear selection
    setSelectedRestaurants([]);
    
    // Show success message
    alert(`Added ${wheelOptions.length} restaurants to the wheel!`);
  };

  // Generate random color
  const getRandomColor = (): string => {
    const colors = [
      '#E53935', '#1E88E5', '#43A047', '#FFB300', 
      '#6D4C41', '#00ACC1', '#9C27B0', '#F4511E',
      '#3949AB', '#039BE5', '#7CB342', '#FFC107'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle radius change
  const handleRadiusChange = async (newRadius: number) => {
    setSearchRadius(newRadius);
    
    // Update circle radius
    if (currentLocation && mapInstance) {
      // Remove old circle
      if (radiusCircle) {
        radiusCircle.setMap(null);
      }
      
      // Create new circle
      const circle = new google.maps.Circle({
        map: mapInstance.map,
        center: { lat: currentLocation.position[1], lng: currentLocation.position[0] },
        radius: newRadius,
        strokeColor: '#2196F3',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#2196F3',
        fillOpacity: 0.1
      });
      
      setRadiusCircle(circle);

      try {
        // Search restaurants in new radius
        const nearbyRestaurants = await searchNearbyRestaurants(
          mapInstance,
          currentLocation.position,
          newRadius,
          searchKeyword
        );
        
        setRestaurants(nearbyRestaurants);
        
        // Confirmation dialog
        if (nearbyRestaurants.length > 0) {
          const shouldAdd = window.confirm(
            `In ${newRadius >= 1000 ? (newRadius/1000).toFixed(1) + ' kilometers' : newRadius + ' meters'} range found ${nearbyRestaurants.length} restaurants, add all to wheel?`
          );
          
          if (shouldAdd) {
            // Add all restaurants to wheel
            const wheelOptions: WheelOption[] = nearbyRestaurants.map(restaurant => ({
              id: restaurant.id,
              label: restaurant.name,
              color: getRandomColor(),
              weight: 1,
              metadata: {
                address: restaurant.address,
                distance: restaurant.distance,
                location: restaurant.location,
                category: restaurant.category,
                rating: restaurant.rating
              }
            }));
            
            onAddRestaurants(wheelOptions);
            alert(`${wheelOptions.length} restaurants added to wheel!`);
          }
        }
      } catch (error) {
        console.error('Restaurant search failed:', error);
        setError('Restaurant search failed. Please try again later');
      }
    }
  };

  return (
    <div className={styles.mapView}>
      <h3 className={styles.title}>Nearby Restaurants</h3>
      
      <div className={styles.mapControls}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder={t('enterKeywords')}
            className={styles.searchInput}
          />
          
          <select
            value={searchRadius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className={styles.radiusSelect}
          >
            <option value={500}>{t('within500m')}</option>
            <option value={1000}>{t('within1km')}</option>
            <option value={2000}>{t('within2km')}</option>
            <option value={5000}>{t('within5km')}</option>
          </select>

          <select
            value={diningMode}
            onChange={(e) => setDiningMode(e.target.value as 'all' | 'dineIn' | 'delivery')}
            className={styles.modeSelect}
          >
            <option value="all">All Restaurants</option>
            <option value="dineIn">Dine-In Only</option>
            <option value="delivery">Delivery Only</option>
          </select>
          
          <button 
            onClick={handleSearch}
            className={styles.searchButton}
            disabled={loading || !mapInstance || !currentLocation}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        
        {selectedRestaurants.length > 0 && (
          <button 
            onClick={handleAddToWheel}
            className={styles.addButton}
            disabled={loading}
          >
            Add {selectedRestaurants.length} Restaurant{selectedRestaurants.length !== 1 ? 's' : ''} to Wheel
          </button>
        )}
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <div 
        id="map-container"
        ref={mapContainerRef}
        className={styles.mapContainer}
        style={{ minHeight: '380px' }}
      ></div>
      
      <div className={styles.restaurantList}>
        <h4>Search Results ({restaurants.length})</h4>
        
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : restaurants.length === 0 ? (
          <div className={styles.empty}>No restaurants found</div>
        ) : (
          <ul className={styles.restaurants}>
            {restaurants.map(restaurant => (
              <li 
                key={restaurant.id}
                className={`${styles.restaurantItem} ${
                  selectedRestaurants.some(r => r.id === restaurant.id) ? styles.selected : ''
                }`}
                onClick={() => handleSelectRestaurant(restaurant)}
              >
                <div className={styles.restaurantInfo}>
                  <h5 className={styles.restaurantName}>
                    {restaurant.name}
                    <div>
                      {restaurant.hasDelivery && <span className={styles.deliveryBadge}>Delivery</span>}
                      {restaurant.hasDineIn && <span className={styles.dineInBadge}>Dine-In</span>}
                    </div>
                  </h5>
                  
                  {restaurant.popularDishes && restaurant.popularDishes.length > 0 && (
                    <div className={styles.popularDishes}>
                      <span className={styles.popularLabel}>Popular Dishes:</span>
                      <span className={styles.dishTag}>
                        {restaurant.popularDishes.join(', ')}
                      </span>
                    </div>
                  )}
                  
                  <p className={styles.restaurantAddress}>{restaurant.address}</p>
                  <div className={styles.restaurantMeta}>
                    <span className={styles.distance}>{(restaurant.distance / 1000).toFixed(1)}km</span>
                    {restaurant.rating && restaurant.rating > 0 && (
                      <span className={styles.rating}>
                        {Array(Math.floor(restaurant.rating || 0)).fill('★').join('')}
                        {(restaurant.rating % 1) > 0 ? '☆' : ''}
                        {Array(5 - Math.ceil(restaurant.rating || 0)).fill('☆').join('')}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.restaurantCheck}>
                  {selectedRestaurants.some(r => r.id === restaurant.id) && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MapView; 