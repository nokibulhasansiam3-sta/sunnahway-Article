<template>
  <div class="card">
    <div class="card-header">Categories</div>
    <div class="card-body space-y-4">
      <form @submit.prevent="onAdd" class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label class="label">Title (BN)</label>
          <input class="input" v-model="titleBn" placeholder="বাংলা শিরোনাম" />
        </div>
        <div>
          <label class="label">Title (EN)</label>
          <input class="input" v-model="titleEn" placeholder="English title" />
        </div>
        <div>
          <label class="label">Title (AR)</label>
          <input class="input" v-model="titleAr" placeholder="العنوان" dir="rtl" />
        </div>
        <div class="flex items-end">
          <button class="btn btn-primary w-full" type="submit">Add</button>
        </div>
      </form>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-600">
              <th class="py-2 pr-3">ID</th>
              <th class="py-2 pr-3">BN</th>
              <th class="py-2 pr-3">EN</th>
              <th class="py-2 pr-3">AR</th>
              <th class="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td class="py-3" colspan="5">Loading...</td></tr>
            <tr v-else-if="items.length === 0"><td class="py-3" colspan="5">No categories yet</td></tr>
            <tr v-else v-for="cat in items" :key="cat.id" class="border-t">
              <td class="py-2 pr-3"><span class="badge">{{ cat.id }}</span></td>
              <td class="py-2 pr-3">{{ cat.titleBn }}</td>
              <td class="py-2 pr-3">{{ cat.titleEn }}</td>
              <td class="py-2 pr-3" dir="rtl">{{ cat.titleAr }}</td>
              <td class="py-2">
                <button class="btn btn-outline" @click="onDelete(cat.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { addCategory, deleteCategory, listCategories, type Category } from '../api'

const items = ref<Category[]>([])
const titleBn = ref('')
const titleEn = ref('')
const titleAr = ref('')
const loading = ref(true)

async function refresh() {
  loading.value = true
  items.value = await listCategories()
  loading.value = false
}

onMounted(refresh)

async function onAdd() {
  const created = await addCategory({ titleBn: titleBn.value, titleEn: titleEn.value, titleAr: titleAr.value })
  items.value.push(created)
  titleBn.value = ''
  titleEn.value = ''
  titleAr.value = ''
}

async function onDelete(id: string) {
  if (!confirm('Delete this category?')) return
  await deleteCategory(id)
  items.value = items.value.filter(x => x.id !== id)
}
</script>
