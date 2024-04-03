import { useUserData } from '@/hooks/useUserDatas';
import { Redirect } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Text, View, StyleSheet, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function User() {
  const { top } = useSafeAreaInsets();
  const { data } = useUserData();

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<BarCodeData | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);

  const resetScanner = () => {
    setScanned(false);
    setScannedData(null);
  };

  const allergensMatchUser = (allergens: string[]) => {
    const userAllergenKeys =
      data?.allergens?.map((allergen) => allergen.key) || [];

    console.log('userAllergenKeys', userAllergenKeys);

    const matchedAllergens = allergens?.filter((allergene) =>
      userAllergenKeys.includes(allergene),
    );

    return matchedAllergens.map((allergen) => {
      return {
        key: allergen,
        value: data?.allergens?.find((a) => a.key === allergen)?.value,
      };
    });
  };

  const allergenMatch = useMemo(
    () =>
      product ? allergensMatchUser(product?.product?.allergens_tags || []) : [],
    [product],
  );

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  useEffect(() => {
    if (scannedData) {
      getProduct()
        .then((d) => setProduct(d))
        .catch(() => {
          resetScanner();
          alert('Failed to get product data. Please try again.');
        });
    }
  }, [scannedData]);

  if (data === null) {
    return <Redirect href="/" />;
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScannedData({ type, data });
    setScanned(true);
  };

  const getProduct = async () => {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${scannedData?.data}?lc=fr`,
    );

    const data = await response.json();

    return data;
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ paddingTop: top }} className="flex flex-1 p-5">
      <Text className="pt-5 pb-8 text-3xl font-semibold text-center">
        {data?.name}
      </Text>

      {scanned ? (
        <View className="flex flex-col mb-5 gap-y-3">
          <Image
            className="w-[70%] mx-auto aspect-square mb-5 rounded-xl"
            source={{
              uri: product?.product?.image_url || '',
            }}
          />

          <Text>
            <Text className="font-semibold">Produit :</Text>{' '}
            {product?.product?.product_name_fr || 'Aucun nom trouvé'}
          </Text>

          <Text>
            <Text className="font-semibold">Ingrédients :</Text>{' '}
            {product?.product?.ingredients
              ?.map((ingredient) => ingredient.text.replace(/_/g, ' '))
              .join(', ') || 'Aucun ingrédient trouvé'}
          </Text>

          <Text>
            <Text className="font-semibold">Allergènes :</Text>{' '}
            {product?.product?.allergens_imported || 'Aucun allergène trouvé'}
          </Text>

          {allergenMatch.length ? (
            <>
              <Text className="font-semibold text-red-500">
                Attention, {allergenMatch.length} allergène(s) trouvé(s) :
              </Text>

              {allergenMatch.map((allergen) => (
                <Text key={allergen.key} className="font-semibold text-red-500">
                  - {allergen.value}
                </Text>
              ))}
            </>
          ) : null}
        </View>
      ) : (
        <View className="relative flex flex-col justify-center flex-1">
          <View className="absolute z-40 w-[70%] h-auto aspect-square -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
            <View className="relative w-full h-full">
              <View className="absolute top-0 left-0 w-[30%] h-[10px] bg-white"></View>
              <View className="absolute top-0 left-0 h-[30%] w-[10px] bg-white"></View>

              <View className="absolute top-0 right-0 w-[30%] h-[10px] bg-white"></View>
              <View className="absolute top-0 right-0 h-[30%] w-[10px] bg-white"></View>

              <View className="absolute bottom-0 left-0 w-[30%] h-[10px] bg-white"></View>
              <View className="absolute bottom-0 left-0 h-[30%] w-[10px] bg-white"></View>

              <View className="absolute bottom-0 right-0 w-[30%] h-[10px] bg-white"></View>
              <View className="absolute bottom-0 right-0 h-[30%] w-[10px] bg-white"></View>
            </View>
          </View>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      )}

      {scanned && (
        <Pressable
          className="flex items-center justify-center px-4 py-2 mt-5 bg-gray-900 rounded-lg h-11"
          onPress={resetScanner}
        >
          <Text className="font-semibold text-white">
            Scanner un nouveau produit
          </Text>
        </Pressable>
      )}
    </View>
  );
}
