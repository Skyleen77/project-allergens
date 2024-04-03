/// <reference types="nativewind/types" />

declare module 'expo-router' {
  interface LinkProps<T> extends OriginalLinkProps {
    href: string;
  }
}

interface Allergen {
  key: string;
  value: string;
}

interface UserData {
  name: string;
  allergens: Allergen[];
}

interface BarCodeData {
  type: string;
  data: string;
}

interface ProductData {
  code: string;
  product: {
    allergens_tags: string[];
    allergens_imported: string;
    ingredients: {
      id: string;
      text: string;
    }[];
    product_name_fr: string;
    image_url: string;
  };
}
