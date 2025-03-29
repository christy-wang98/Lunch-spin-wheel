/// <reference types="@types/google.maps" />
import cacheService from './cacheService';
import rateLimiter from './rateLimiter';

// Google Maps API Key
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// 定义地图实例类型
export interface MapInstance {
  map: google.maps.Map;
  places: google.maps.places.PlacesService;
}

// 定义餐厅信息类型
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  distance: number; // 距离，单位米
  location: [number, number]; // 经纬度
  category?: string; // 餐厅类型
  rating?: number; // 评分，满分5分
  photos?: string[]; // 照片URL列表
  priceLevel?: number; // 价格等级，1-4
  hasDelivery: boolean;
  hasDineIn: boolean;
  deliveryServices?: string[];
}

// 加载Google Maps API
const loadGoogleMapsApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      console.log('Google Maps API 已加载');
      resolve();
      return;
    }

    console.log('开始加载 Google Maps API...');
    console.log('API Key:', API_KEY ? '已设置' : '未设置');

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry&language=zh-CN&region=CN`;
    script.async = true;
    script.defer = true;
    
    script.onerror = (error) => {
      console.error('Google Maps API 加载失败:', error);
      reject(new Error('Google Maps API 加载失败，请检查网络连接和API密钥设置'));
    };
    
    script.onload = () => {
      console.log('Google Maps API 加载成功');
      resolve();
    };
    
    document.head.appendChild(script);
  });
};

/**
 * 初始化Google地图
 * @param containerId 地图容器ID
 * @returns 地图实例和Places服务
 */
export const initMap = async (containerId: string): Promise<MapInstance> => {
  try {
    await loadGoogleMapsApi();

    const mapElement = document.getElementById(containerId);
    if (!mapElement) {
      throw new Error('Map container not found');
    }

    const map = new google.maps.Map(mapElement, {
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    const places = new google.maps.places.PlacesService(map);

    return { map, places };
  } catch (error) {
    console.error('Failed to initialize map:', error);
    throw new Error('Map initialization failed');
  }
};

/**
 * 获取用户当前位置
 * @param mapInstance 地图实例
 * @returns 位置信息，包括经纬度和地址
 */
export const getCurrentLocation = (mapInstance: MapInstance): Promise<{
  position: [number, number];
  address: string;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location: [number, number] = [longitude, latitude];

        console.log('Successfully got location:', { latitude, longitude });

        // 创建标记
        new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapInstance.map,
          title: 'Your Location',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          }
        });

        // 设置地图中心
        mapInstance.map.setCenter({ lat: latitude, lng: longitude });

        // 获取地址
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({
            location: { lat: latitude, lng: longitude }
          });

          const address = result.results[0]?.formatted_address || '';
          resolve({ position: location, address });
        } catch (error) {
          console.error('Geocoding failed:', error);
          resolve({ position: location, address: '' });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enable location access in your browser settings.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable. Please check your device settings.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out. Please try again.'));
            break;
          default:
            reject(new Error(`Failed to get location: ${error.message}`));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // 增加超时时间到30秒
        maximumAge: 0
      }
    );
  });
};

/**
 * 搜索附近餐厅
 * @param mapInstance 地图实例
 * @param position 中心点位置 [经度, 纬度]
 * @param radius 搜索半径，单位米
 * @param keywords 关键词
 * @returns 餐厅列表
 */
export const searchNearbyRestaurants = async (
  mapInstance: MapInstance,
  position: [number, number],
  radius: number = 1000,
  keywords: string = ''
): Promise<Restaurant[]> => {
  // 检查是否可以发送请求
  if (!rateLimiter.canMakeRequest('places')) {
    const waitTime = rateLimiter.getTimeToNextWindow('places');
    throw new Error(`请求过于频繁，请等待 ${Math.ceil(waitTime / 1000)} 秒后重试`);
  }

  // 生成缓存键
  const cacheKey = `restaurants:${position.join(',')}:${radius}:${keywords}`;
  
  // 检查缓存
  const cachedResults = cacheService.get<Restaurant[]>(cacheKey);
  if (cachedResults) {
    return cachedResults;
  }

  return new Promise((resolve, reject) => {
    const request: google.maps.places.PlaceSearchRequest = {
      location: { lat: position[1], lng: position[0] },
      radius,
      type: 'restaurant',
      keyword: keywords
    };

    console.log('Searching for restaurants with params:', request);

    // 记录请求
    rateLimiter.logRequest('places');

    // 清除现有标记
    mapInstance.map.data.forEach((feature: google.maps.Data.Feature) => {
      mapInstance.map.data.remove(feature);
    });

    mapInstance.places.nearbySearch(request, async (
      results: google.maps.places.PlaceResult[] | null,
      status: google.maps.places.PlacesServiceStatus
    ) => {
      console.log('Search results status:', status);
      console.log('Found restaurants:', results);
      
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const restaurants: Restaurant[] = [];
        const bounds = new google.maps.LatLngBounds();

        for (const place of results || []) {
          if (!place.geometry?.location) continue;

          const placeLocation = place.geometry.location;
          bounds.extend(placeLocation);

          // 创建标记
          new google.maps.Marker({
            position: placeLocation,
            map: mapInstance.map,
            title: place.name,
            animation: google.maps.Animation.DROP
          });

          try {
            const details = await getPlaceDetails(mapInstance, place.place_id!);
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(position[1], position[0]),
              placeLocation
            );

            restaurants.push({
              id: place.place_id!,
              name: place.name!,
              address: details.formatted_address || '',
              distance,
              location: [placeLocation.lng(), placeLocation.lat()],
              category: place.types?.join(', ') || '',
              rating: place.rating,
              photos: place.photos?.map((photo: google.maps.places.PlacePhoto) => photo.getUrl({ maxWidth: 400 })) || [],
              priceLevel: place.price_level,
              hasDelivery: place.business_status === 'OPERATIONAL',
              hasDineIn: place.business_status === 'OPERATIONAL',
              deliveryServices: [] // 这个信息需要通过其他API获取
            });
          } catch (error) {
            console.error('Failed to get place details:', error);
          }
        }

        // 调整地图视野以显示所有标记
        mapInstance.map.fitBounds(bounds);

        // 缓存结果
        cacheService.set(cacheKey, restaurants);
        
        resolve(restaurants);
      } else {
        console.error('Failed to search restaurants, status:', status);
        reject(new Error(`Failed to search restaurants: ${status}`));
      }
    });
  });
};

/**
 * 获取地点详细信息
 * @param mapInstance 地图实例
 * @param placeId 地点ID
 * @returns 地点详细信息
 */
const getPlaceDetails = async (
  mapInstance: MapInstance,
  placeId: string
): Promise<google.maps.places.PlaceResult> => {
  // 检查是否可以发送请求
  if (!rateLimiter.canMakeRequest('places')) {
    const waitTime = rateLimiter.getTimeToNextWindow('places');
    throw new Error(`请求过于频繁，请等待 ${Math.ceil(waitTime / 1000)} 秒后重试`);
  }

  // 检查缓存
  const cacheKey = `place:${placeId}`;
  const cachedDetails = cacheService.get<google.maps.places.PlaceResult>(cacheKey);
  if (cachedDetails) {
    return cachedDetails;
  }

  return new Promise((resolve, reject) => {
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId,
      fields: [
        'formatted_address',
        'opening_hours',
        'website',
        'formatted_phone_number',
        'business_status',
        'delivery',
        'dine_in',
        'takeout'
      ]
    };

    // 记录请求
    rateLimiter.logRequest('places');

    mapInstance.places.getDetails(request, (
      place: google.maps.places.PlaceResult | null,
      status: google.maps.places.PlacesServiceStatus
    ) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        // 缓存结果
        cacheService.set(cacheKey, place);
        resolve(place);
      } else {
        reject(new Error('Failed to get place details'));
      }
    });
  });
};

/**
 * 根据关键词和类型筛选餐厅
 * @param restaurants 餐厅列表
 * @param keyword 关键词
 * @param category 类型
 * @returns 筛选后的餐厅列表
 */
export const filterRestaurants = (
  restaurants: Restaurant[],
  keyword?: string,
  category?: string
): Restaurant[] => {
  return restaurants.filter(restaurant => {
    const matchKeyword = !keyword || 
      restaurant.name.toLowerCase().includes(keyword.toLowerCase()) || 
      restaurant.address.toLowerCase().includes(keyword.toLowerCase());
    
    const matchCategory = !category || 
      (restaurant.category && restaurant.category.toLowerCase().includes(category.toLowerCase()));
    
    return matchKeyword && matchCategory;
  });
}; 