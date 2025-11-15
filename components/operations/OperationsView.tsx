'use client'

import Title from '../ui/title'
import TasksView from './TasksView'
import RemindersView from './RemindersView'

export default function OperationsView() {
  return (
    <div>
      <Title>Operations</Title>
      
      <div className="space-y-6">
        <TasksView />
        <RemindersView />
      </div>
    </div>
  )
}
