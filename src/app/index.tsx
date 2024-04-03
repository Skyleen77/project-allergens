import { TextInput } from '@/components/TextInput';
import { formatedAllergens } from '@/constants/formatedAllergens';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import classnames from 'classnames';
import { Redirect } from 'expo-router';
import { saveData } from '@/utils';
import { useUserData } from '@/hooks/useUserDatas';

export default function Page() {
  const { top } = useSafeAreaInsets();
  const [value, setValue] = useState<string>('');
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const { data, mutate } = useUserData();

  if (data) {
    return <Redirect href="/user" />;
  }

  return (
    <View style={{ paddingTop: top }} className="flex flex-1 p-5">
      <Text className="pt-5 pb-8 text-3xl font-semibold text-center">
        Création du profil
      </Text>

      <TextInput
        label="Name"
        onChangeText={(text) => setValue(text)}
        value={value}
      />

      <View className="w-full mt-5">
        <Text>Allergènes</Text>
        <View className="flex flex-row flex-wrap gap-2 mt-2">
          {formatedAllergens.map((allergen) => (
            <Pressable
              key={allergen.key}
              className={classnames(
                'py-2 px-4 border flex h-11 items-center justify-center border-gray-300 rounded-lg',
                allergens?.includes(allergen) &&
                  'bg-gray-900 border-gray-900 text-white',
              )}
              onPress={() => {
                setAllergens((prev) => {
                  if (prev?.includes(allergen)) {
                    return prev?.filter((a) => a !== allergen);
                  }

                  return [...prev, allergen];
                });
              }}
            >
              <Text
                className={
                  allergens?.includes(allergen) ? 'text-white' : 'text-black'
                }
              >
                {allergen.value}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        className="flex items-center justify-center px-4 py-2 mt-5 bg-gray-900 rounded-lg h-11"
        onPress={async () => {
          await saveData(value, allergens);
          mutate();
        }}
      >
        <Text className="font-semibold text-white">Créer mon profil</Text>
      </Pressable>
    </View>
  );
}
