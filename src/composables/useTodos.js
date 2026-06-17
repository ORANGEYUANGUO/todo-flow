/**
 * useTodos - Todo 数据状态与操作逻辑
 * 从 TodoList.vue 抽取，负责所有 Todo CRUD、筛选排序、持久化
 */
import { ref, computed, watch } from 'vue'

// ─── 常量 ──────────────────────────────────────────────────
export const priorities = [
  { value: 'none', label: '无', color: 'bg-gray-500', textColor: 'text-gray-500' },
  { value: 'low', label: '低', color: 'bg-green-500', textColor: 'text-green-400' },
  { value: 'medium', label: '中', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  { value: 'high', label: '高', color: 'bg-red-500', textColor: 'text-red-400' },
]

export const categories = [
  { value: 'personal', label: '个人', icon: '👤', color: 'from-blue-500 to-cyan-500' },
  { value: 'work', label: '工作', icon: '💼', color: 'from-purple-500 to-pink-500' },
  { value: 'study', label: '学习', icon: '📚', color: 'from-orange-500 to-amber-500' },
  { value: 'health', label: '健康', icon: '💪', color: 'from-green-500 to-emerald-500' },
  { value: 'other', label: '其他', icon: '📌', color: 'from-gray-500 to-slate-500' },
]

// ─── Demo 数据 ──────────────────────────────────────────────
export const DEMO_TODOS = [
  {
    id: crypto.randomUUID(),
    text: '试试添加一个新的 Todo ✨',
    completed: false,
    createdAt: Date.now(),
    scheduledAt: null,
    priority: 'medium',
    category: 'personal',
    reminder: null,
  },
  {
    id: crypto.randomUUID(),
    text: '这个 Todo 已经完成了',
    completed: true,
    createdAt: Date.now() - 1000,
    scheduledAt: null,
    priority: 'low',
    category: 'personal',
    reminder: null,
  },
]

export function useTodos() {
  // ─── 响应式状态 ────────────────────────────────────────
  const todos = ref([])
  const inputText = ref('')
  const selectedPriority = ref('none')
  const selectedCategory = ref('personal')
  const showTimePicker = ref(false)
  const scheduledDate = ref('')
  const scheduledTime = ref('')
  const reminderMinutes = ref(15)

  // 筛选状态
  const filter = ref('all')
  const activePriorityFilter = ref('all')
  const activeCategoryFilter = ref('all')
  const sortBy = ref('created')

  // UI 状态
  const newConfetti = ref([])
  const completedCount = ref(0)

  // ─── 计算属性 ──────────────────────────────────────────
  const filteredTodos = computed(() => {
    let result = [...todos.value]

    if (filter.value === 'active') result = result.filter(t => !t.completed)
    if (filter.value === 'completed') result = result.filter(t => t.completed)

    if (activePriorityFilter.value !== 'all') {
      result = result.filter(t => t.priority === activePriorityFilter.value)
    }

    if (activeCategoryFilter.value !== 'all') {
      result = result.filter(t => t.category === activeCategoryFilter.value)
    }

    result.sort((a, b) => {
      if (sortBy.value === 'priority') {
        const pOrder = { high: 0, medium: 1, low: 2, none: 3 }
        return pOrder[a.priority] - pOrder[b.priority]
      }
      if (sortBy.value === 'scheduled') {
        if (!a.scheduledAt && !b.scheduledAt) return 0
        if (!a.scheduledAt) return 1
        if (!b.scheduledAt) return -1
        return new Date(a.scheduledAt) - new Date(b.scheduledAt)
      }
      return b.createdAt - a.createdAt
    })

    return result
  })

  const stats = computed(() => {
    const total = todos.value.length
    const completed = todos.value.filter(t => t.completed).length
    const active = total - completed
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, active, percentage }
  })

  const upcomingReminders = computed(() => {
    const now = Date.now()
    return todos.value
      .filter(t => t.reminder && !t.completed && t.scheduledAt)
      .filter(t => {
        const sched = new Date(t.scheduledAt).getTime()
        const reminderTime = sched - (t.reminder * 60 * 1000)
        return reminderTime <= now && reminderTime + 30000 >= now
      })
      .map(t => ({
        text: t.text,
        time: t.reminder + ' 分钟后'
      }))
  })

  // ─── 操作 ────────────────────────────────────────────
  function addTodo() {
    const text = inputText.value.trim()
    if (!text) return

    const todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
      scheduledAt: scheduledDate.value && scheduledTime.value
        ? `${scheduledDate.value}T${scheduledTime.value}`
        : null,
      priority: selectedPriority.value,
      category: selectedCategory.value,
      reminder: showTimePicker.value && scheduledDate.value && scheduledTime.value
        ? Number(reminderMinutes.value)
        : null,
    }

    todos.value.unshift(todo)
    inputText.value = ''
    selectedPriority.value = 'none'
    showTimePicker.value = false
    scheduledDate.value = ''
    scheduledTime.value = ''
  }

  function toggleTodo(id) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      if (todo.completed) {
        spawnConfetti()
        completedCount.value++
      }
    }
  }

  function deleteTodo(id) {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  function clearCompleted() {
    todos.value = todos.value.filter(t => !t.completed)
  }

  function spawnConfetti() {
    const pieces = Array.from({ length: 8 }, (_, i) => ({
      id: crypto.randomUUID(),
      x: Math.random() * 100,
      color: ['#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'][i],
      delay: Math.random() * 0.3,
    }))
    newConfetti.value = [...newConfetti.value, ...pieces]
    setTimeout(() => {
      newConfetti.value = newConfetti.value.filter(c => !pieces.find(p => p.id === c.id))
    }, 1500)
  }

  // ─── 工具函数 ────────────────────────────────────────
  function isOverdue(todo) {
    if (!todo.scheduledAt || todo.completed) return false
    return new Date(todo.scheduledAt) < new Date()
  }

  function formatTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${month}/${day} ${hours}:${mins}`
  }

  function getRemainingTime(todo) {
    if (!todo.scheduledAt || todo.completed) return null
    const sched = new Date(todo.scheduledAt).getTime()
    const now = Date.now()
    const diff = sched - now

    if (diff <= 0) return '已过期'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}小时${mins}分后`
    return `${mins}分钟后`
  }

  // ─── 持久化 ──────────────────────────────────────────
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('todo-flow-data')
      if (stored) {
        todos.value = JSON.parse(stored)
      }
    } catch {
      // ignore
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem('todo-flow-data', JSON.stringify(todos.value))
    } catch {
      // ignore
    }
  }

  watch(todos, saveToStorage, { deep: true })

  return {
    // 状态
    todos, inputText, selectedPriority, selectedCategory,
    showTimePicker, scheduledDate, scheduledTime, reminderMinutes,
    filter, activePriorityFilter, activeCategoryFilter, sortBy,
    newConfetti, completedCount,
    // 计算属性
    filteredTodos, stats, upcomingReminders,
    // 操作
    addTodo, toggleTodo, deleteTodo, clearCompleted, spawnConfetti,
    // 工具
    isOverdue, formatTime, getRemainingTime,
    // 持久化
    loadFromStorage,
  }
}