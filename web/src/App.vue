<template>
  <div class="min-h-screen">
    <header class="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
      <div class="container py-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">Sunnahway Articles Admin</h1>
        <div class="flex items-center gap-2">
          <a class="btn btn-outline" href="https://github.com/nokibulhasansiam3-sta/sunnahway-Article" target="_blank">Repo</a>
        </div>
      </div>
    </header>

    <main class="container py-6 space-y-6">
      <!-- Categories quick manage -->
      <CategoryManager />

      <!-- File-manager style workspace -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 min-h-[70vh]">
          <SidebarExplorer @select="onSelect" @newIn="onNewIn" @newRoot="onNew" />
        </div>
        <div class="lg:col-span-2 min-h-[70vh]">
          <EditorPanel :selected-id="selectedId" :draft-category-id="draftCategoryId" @saved="onSaved" @deleted="onDeleted" />
        </div>
      </div>
    </main>

    <!-- Toasts -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <div v-for="t in toast.state.list" :key="t.id"
           class="px-4 py-2 rounded-lg shadow text-white"
           :class="{
             'bg-emerald-600': t.type === 'success',
             'bg-rose-600': t.type === 'error',
             'bg-slate-800': !t.type || t.type === 'info'
           }">
        {{ t.text }}
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CategoryManager from './components/CategoryManager.vue'
import SidebarExplorer from './components/SidebarExplorer.vue'
import EditorPanel from './components/EditorPanel.vue'
import { useToast } from './useToast'
const toast = useToast()

const selectedId = ref<string | null>(null)
const draftCategoryId = ref<string | null>(null)

function onSelect(id: string) {
  selectedId.value = id
  draftCategoryId.value = null
}
function onNewIn(categoryId: string) {
  selectedId.value = null
  draftCategoryId.value = categoryId
}
function onNew() {
  selectedId.value = null
  draftCategoryId.value = ''
}
function onSaved(id: string) {
  selectedId.value = id
}
function onDeleted() {
  selectedId.value = null
}
</script>

<style>
</style>
