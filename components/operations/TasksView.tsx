'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import TaskFormModal from './TaskFormModal'

interface Task {
  id: string
  title: string
  priority: string
  deadline: string
  status: string
}

export default function TasksView() {
  const t = useTranslations("operations")
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const updateTaskStatus = async (id: string, status: string) => {
    setUpdatingTaskId(id)
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (res.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-orange-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', task.id)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (draggedTask && draggedTask.status !== targetStatus && !updatingTaskId) {
      updateTaskStatus(draggedTask.id, targetStatus)
    }
    
    setDraggedTask(null)
  }

  const todoTasks = tasks.filter(t => t.status === 'todo')
  const inProgressTasks = tasks.filter(t => t.status === 'inprogress')
  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('task_planner')}</h2>
        <button className="bg-[#1161EF] text-white hover:bg-[#1161EF]/80 transition-all duration-200 px-4 py-2 rounded-md" onClick={() => setIsModalOpen(true)}>{t('add_task')}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`p-4 rounded-lg shadow-sm min-h-[200px] transition-colors relative ${
            updatingTaskId
              ? 'bg-gray-50 dark:bg-zinc-800 opacity-50 pointer-events-none'
              : dragOverColumn === 'todo'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
              : 'bg-white dark:bg-zinc-900'
          }`}
          onDragOver={(e) => !updatingTaskId && handleDragOver(e, 'todo')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => !updatingTaskId && handleDrop(e, 'todo')}
        >
          <h3 className="text-lg font-semibold mb-4">{t('todo')}</h3>
          {todoTasks.map((task) => (
            <div
              key={task.id}
              draggable={!updatingTaskId && updatingTaskId !== task.id}
              onDragStart={(e) => !updatingTaskId && handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
              className={`p-3 mb-2 rounded-md border transition-all ${
                updatingTaskId === task.id
                  ? 'bg-gray-100 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 opacity-60 cursor-wait'
                  : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 cursor-move hover:shadow-md'
              }`}
            >
              {updatingTaskId === task.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-zinc-700/80 rounded-md">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
              <div className="flex items-center gap-2 mb-2 relative">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                <p className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                📅 {new Date(task.deadline).toLocaleDateString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
        <div
          className={`p-4 rounded-lg shadow-sm min-h-[200px] transition-colors relative ${
            updatingTaskId
              ? 'bg-gray-50 dark:bg-zinc-800 opacity-50 pointer-events-none'
              : dragOverColumn === 'inprogress'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
              : 'bg-white dark:bg-zinc-900'
          }`}
          onDragOver={(e) => !updatingTaskId && handleDragOver(e, 'inprogress')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => !updatingTaskId && handleDrop(e, 'inprogress')}
        >
          <h3 className="text-lg font-semibold mb-4">{t('in_progress')}</h3>
          {inProgressTasks.map((task) => (
            <div
              key={task.id}
              draggable={!updatingTaskId && updatingTaskId !== task.id}
              onDragStart={(e) => !updatingTaskId && handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
              className={`p-3 mb-2 rounded-md border transition-all relative ${
                updatingTaskId === task.id
                  ? 'bg-gray-100 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 opacity-60 cursor-wait'
                  : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 cursor-move hover:shadow-md'
              }`}
            >
              {updatingTaskId === task.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-zinc-700/80 rounded-md z-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
              <div className="flex items-center gap-2 mb-2 relative">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                <p className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                📅 {new Date(task.deadline).toLocaleDateString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
        <div
          className={`p-4 rounded-lg shadow-sm min-h-[200px] transition-colors relative ${
            updatingTaskId
              ? 'bg-gray-50 dark:bg-zinc-800 opacity-50 pointer-events-none'
              : dragOverColumn === 'done'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
              : 'bg-white dark:bg-zinc-900'
          }`}
          onDragOver={(e) => !updatingTaskId && handleDragOver(e, 'done')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => !updatingTaskId && handleDrop(e, 'done')}
        >
          <h3 className="text-lg font-semibold mb-4">{t('done')}</h3>
          {doneTasks.map((task) => (
            <div
              key={task.id}
              draggable={!updatingTaskId && updatingTaskId !== task.id}
              onDragStart={(e) => !updatingTaskId && handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
              className={`p-3 mb-2 rounded-md border transition-all relative ${
                updatingTaskId === task.id
                  ? 'bg-gray-100 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 opacity-60 cursor-wait'
                  : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 cursor-move hover:shadow-md'
              }`}
            >
              {updatingTaskId === task.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-zinc-700/80 rounded-md z-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
              <div className="flex items-center gap-2 mb-2 relative">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                <p className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                📅 {new Date(task.deadline).toLocaleDateString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      </div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchTasks()
        }}
      />
    </div>
  )
}

