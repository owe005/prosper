<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { categoryService, type Category } from '@/services/categoryService'
import { supabase } from '@/lib/supabase'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const categories = ref<Category[]>([])
const isLoading = ref(true)
const error = ref('')
const showDropdown = ref(false)
const inputValue = ref(props.modelValue)

const loadCategories = async () => {
  try {
    isLoading.value = true
    categories.value = await categoryService.getCategories()
  } catch (e) {
    error.value = 'Failed to load categories'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const filteredCategories = computed(() => {
  const search = inputValue.value.toLowerCase()
  return categories.value.filter(cat => 
    cat.name.toLowerCase().includes(search)
  )
})

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  inputValue.value = value
  emit('update:modelValue', value)
  showDropdown.value = true
}

const selectCategory = (category: Category) => {
  inputValue.value = category.name
  emit('update:modelValue', category.name)
  showDropdown.value = false
}

const handleBlur = () => {
  // Delay hiding dropdown to allow click events to fire
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

onMounted(loadCategories)

// Watch for external value changes
watch(() => props.modelValue, (newValue: string) => {
  inputValue.value = newValue
})
</script>

<template>
  <div class="category-input">
    <input
      type="text"
      :value="inputValue"
      @input="handleInput"
      @focus="showDropdown = true"
      @blur="handleBlur"
      placeholder="Enter or select category"
    >
    
    <div v-if="showDropdown && filteredCategories.length > 0" class="dropdown">
      <button
        v-for="category in filteredCategories"
        :key="category.id"
        class="dropdown-item"
        @mousedown="selectCategory(category)"
      >
        {{ category.name }}
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template> 