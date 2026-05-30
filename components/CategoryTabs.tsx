import React from "react";

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  primaryColor?: string;
}

// Map category names to relevant emoji icons
const categoryEmojis: Record<string, string> = {
  "All": "✦",
  "Burgers": "🍔",
  "Desserts": "🍮",
  "Drinks": "🥤",
  "Biryani": "🍛",
  "Starters": "🥗",
  "Main Course": "🍽️",
  "Breads": "🫓",
  "Soups": "🥣",
  "Salads": "🥙",
  "Pasta": "🍝",
  "Pizza": "🍕",
  "Seafood": "🦐",
  "Chicken": "🍗",
  "Veg": "🥦",
  "Snacks": "🥨",
};

function getCategoryEmoji(name: string): string {
  const key = Object.keys(categoryEmojis).find(
    k => name.toLowerCase().includes(k.toLowerCase())
  );
  return key ? categoryEmojis[key] : "🍴";
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  primaryColor = "#E5613D"
}) => {
  return (
    <div className="py-1 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-2.5 select-none">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        const emoji = getCategoryEmoji(category);
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`flex items-center gap-1.5 pl-3 pr-4 h-9 rounded-2xl text-[11px] font-extrabold tracking-wide whitespace-nowrap active:scale-95 transition-all duration-200 ${
              isSelected
                ? "text-white shadow-md"
                : "bg-white dark:bg-[#161A22] text-[#8E7C77] dark:text-slate-400 hover:text-[#3C2C28] dark:hover:text-slate-200 border border-[#EBE3E2] dark:border-slate-800 hover:border-[#E5613D]/30 dark:hover:border-[#FF7A00]/30"
            }`}
            style={isSelected ? { backgroundColor: primaryColor } : undefined}
          >
            <span className="text-[13px] leading-none">{emoji}</span>
            <span>{category}</span>
          </button>
        );
      })}
    </div>
  );
};
