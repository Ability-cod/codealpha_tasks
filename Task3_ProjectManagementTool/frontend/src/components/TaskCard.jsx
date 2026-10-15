import Avatar from './Avatar';
import { formatDate } from '../api';

export default function TaskCard({ task, onDragStart, onClick }) {
  const overdue = task.due_date && new Date(task.due_date) < new Date() && new Date(task.due_date).toDateString() !== new Date().toDateString();

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
    >
      <span className={`priority-dot ${task.priority}`} />
      <p className="task-title">{task.title}</p>
      <div className="task-footer">
        {task.due_date && (
          <span className={`task-due ${overdue ? 'overdue' : ''}`}>{formatDate(task.due_date)}</span>
        )}
        {task.comment_count > 0 && <span className="task-comment-count">💬 {task.comment_count}</span>}
        {task.assignee_id && (
          <Avatar src={task.assignee_avatar} name={task.assignee_name} size={24} />
        )}
      </div>
    </div>
  );
}