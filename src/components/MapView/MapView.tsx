import React, { useEffect, useRef, useState } from 'react';
import { WheelOption } from '../../types/wheel';
import { 
  initMap, 
  MapInstance, 
  getCurrentLocation, 
  searchNearbyRestaurants, 
  Restaurant,
  filterRestaurants
} from '../../utils/mapService';
import styles from './MapView.module.css';

interface MapViewProps {
  onAddRestaurants: (restaurants: WheelOption[]) => void;
}

const MapView: React.FC<MapViewProps> = ({ onAddRestaurants }) => {
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
  const [searchKeyword, setSearchKeyword] = useState<string>('餐厅');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || mapLoaded) return;

    const initializeMap = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const instance = await initMap('map-container');
        setMapInstance(instance);
        setMapLoaded(true);
        
        // 获取当前位置
        try {
          const location = await getCurrentLocation(instance);
          setCurrentLocation(location);
          
          // 搜索附近餐厅
          const nearbyRestaurants = await searchNearbyRestaurants(
            instance,
            location.position,
            searchRadius,
            searchKeyword
          );
          setRestaurants(nearbyRestaurants);
        } catch (locationError) {
          console.error('获取位置失败:', locationError);
          setError('无法获取您的位置，请检查位置权限设置');
        }
        
        setLoading(false);
      } catch (mapError) {
        console.error('地图初始化失败:', mapError);
        setError('地图加载失败，请检查网络连接和API密钥');
        setLoading(false);
      }
    };

    initializeMap();
  }, [mapLoaded, searchRadius, searchKeyword]);

  // 执行餐厅搜索
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
      
      setRestaurants(nearbyRestaurants);
      setLoading(false);
    } catch (searchError) {
      console.error('搜索餐厅失败:', searchError);
      setError('搜索餐厅失败，请稍后重试');
      setLoading(false);
    }
  };

  // 将餐厅添加到选择列表
  const handleSelectRestaurant = (restaurant: Restaurant) => {
    if (selectedRestaurants.some(r => r.id === restaurant.id)) {
      // 如果已选择，则取消选择
      setSelectedRestaurants(selectedRestaurants.filter(r => r.id !== restaurant.id));
    } else {
      // 如果未选择，则添加到选择列表
      setSelectedRestaurants([...selectedRestaurants, restaurant]);
    }
  };

  // 将选择的餐厅添加到转盘选项
  const handleAddToWheel = () => {
    if (selectedRestaurants.length === 0) {
      setError('请至少选择一家餐厅');
      return;
    }

    // 将餐厅转换为转盘选项格式
    const wheelOptions: WheelOption[] = selectedRestaurants.map(restaurant => ({
      id: restaurant.id,
      label: restaurant.name,
      color: getRandomColor(), // 随机分配颜色
      weight: 1,
      // 添加额外信息
      metadata: {
        address: restaurant.address,
        distance: restaurant.distance,
        location: restaurant.location,
        category: restaurant.category,
        rating: restaurant.rating
      }
    }));

    // 回调添加到转盘
    onAddRestaurants(wheelOptions);
    
    // 清空选择
    setSelectedRestaurants([]);
    
    // 显示成功消息
    alert(`已将 ${wheelOptions.length} 家餐厅添加到转盘！`);
  };

  // 生成随机颜色
  const getRandomColor = (): string => {
    const colors = [
      '#E53935', '#1E88E5', '#43A047', '#FFB300', 
      '#6D4C41', '#00ACC1', '#9C27B0', '#F4511E',
      '#3949AB', '#039BE5', '#7CB342', '#FFC107'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className={styles.mapView}>
      <h3 className={styles.title}>附近餐厅</h3>
      
      <div className={styles.mapControls}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="输入关键词，如'中餐'、'快餐'等"
            className={styles.searchInput}
          />
          
          <select
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            className={styles.radiusSelect}
          >
            <option value={500}>500米内</option>
            <option value={1000}>1公里内</option>
            <option value={2000}>2公里内</option>
            <option value={5000}>5公里内</option>
          </select>
          
          <button 
            onClick={handleSearch}
            className={styles.searchButton}
            disabled={loading || !mapInstance || !currentLocation}
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>
        
        {selectedRestaurants.length > 0 && (
          <button 
            onClick={handleAddToWheel}
            className={styles.addButton}
            disabled={loading}
          >
            添加 {selectedRestaurants.length} 家餐厅到转盘
          </button>
        )}
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <div 
        id="map-container"
        ref={mapContainerRef}
        className={styles.mapContainer}
      ></div>
      
      <div className={styles.restaurantList}>
        <h4>搜索结果 ({restaurants.length})</h4>
        
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : restaurants.length === 0 ? (
          <div className={styles.empty}>未找到符合条件的餐厅</div>
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
                  <h5 className={styles.restaurantName}>{restaurant.name}</h5>
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
                    {restaurant.category && (
                      <span className={styles.category}>{restaurant.category}</span>
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