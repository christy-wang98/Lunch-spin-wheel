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
  const [radiusCircle, setRadiusCircle] = useState<google.maps.Circle | null>(null);
  const [diningMode, setDiningMode] = useState<'all' | 'dineIn' | 'delivery'>('all');

  // 初始化地图
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
        
        // 获取当前位置
        try {
          console.log('Getting current location...');
          const location = await getCurrentLocation(instance);
          console.log('Location received:', location);
          setCurrentLocation(location);
          
          // 添加初始圆形范围
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
          
          // 搜索附近餐厅
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
            setError('请在浏览器设置中允许访问位置信息，然后刷新页面重试');
          } else if (locationError.message.includes('unavailable')) {
            setError('无法获取位置信息，请检查设备位置服务是否开启');
          } else if (locationError.message.includes('timeout')) {
            setError('获取位置超时，请检查网络连接并刷新页面重试');
          } else {
            setError(`无法获取位置：${locationError.message}`);
          }
        }
        
        setLoading(false);
      } catch (mapError: any) {
        console.error('Map initialization error:', mapError);
        setError(`地图加载失败：${mapError.message}`);
        setLoading(false);
      }
    };

    initializeMap();
  }, [mapLoaded, searchRadius, searchKeyword]);

  // 修改餐厅筛选逻辑
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

  // 修改搜索结果处理
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

  // 更新搜索半径时的处理函数
  const handleRadiusChange = async (newRadius: number) => {
    setSearchRadius(newRadius);
    
    // 更新圆形范围
    if (currentLocation && mapInstance) {
      // 移除旧的圆形
      if (radiusCircle) {
        radiusCircle.setMap(null);
      }
      
      // 创建新的圆形
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
        // 搜索新半径范围内的餐厅
        const nearbyRestaurants = await searchNearbyRestaurants(
          mapInstance,
          currentLocation.position,
          newRadius,
          searchKeyword
        );
        
        setRestaurants(nearbyRestaurants);
        
        // 弹出确认框
        if (nearbyRestaurants.length > 0) {
          const shouldAdd = window.confirm(
            `在 ${newRadius >= 1000 ? (newRadius/1000).toFixed(1) + '公里' : newRadius + '米'} 范围内找到 ${nearbyRestaurants.length} 家餐厅，是否全部添加到转盘？`
          );
          
          if (shouldAdd) {
            // 将所有餐厅添加到转盘
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
            alert(`已将 ${wheelOptions.length} 家餐厅添加到转盘！`);
          }
        }
      } catch (error) {
        console.error('搜索餐厅失败:', error);
        setError('搜索餐厅失败，请稍后重试');
      }
    }
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
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className={styles.radiusSelect}
          >
            <option value={500}>500米内</option>
            <option value={1000}>1公里内</option>
            <option value={2000}>2公里内</option>
            <option value={5000}>5公里内</option>
          </select>

          <select
            value={diningMode}
            onChange={(e) => setDiningMode(e.target.value as 'all' | 'dineIn' | 'delivery')}
            className={styles.modeSelect}
          >
            <option value="all">全部餐厅</option>
            <option value="dineIn">仅堂食</option>
            <option value="delivery">仅外卖</option>
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
        style={{ minHeight: '380px' }}
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
                  <h5 className={styles.restaurantName}>
                    {restaurant.name}
                    {restaurant.hasDelivery && <span className={styles.deliveryBadge}>可外送</span>}
                    {restaurant.hasDineIn && <span className={styles.dineInBadge}>可堂食</span>}
                  </h5>
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