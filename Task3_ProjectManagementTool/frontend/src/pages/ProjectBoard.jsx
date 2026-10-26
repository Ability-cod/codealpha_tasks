import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

export default function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const socket = useSocket();
  const { notify } = useToast();

  const [project, setProject] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [addingListFor, setAddingListFor] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [addingTaskFor, setAddingTaskFor] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showMembers, setShowMembers] = useState(false);

  const loadBoard = useCallback(() => {
    api(`/lists/project/${id}`, { token }).then(setLists);
  }, [id, token]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api(`/projects/${id}`, { token }),
      api(`/lists/project/${id}`, { token })
    ])
      .then(([projectData, listData]) => {
        setProject(projectData);
        setLists(listData);
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_project', id);

    const onTaskCreated = (task) => setLists((prev) => prev.map((l) => l.id === task.list_id ? { ...l, tasks: [...l.tasks, task] } : l));
    const onTaskUpdated = (task) => setLists((prev) => prev.map((l) => ({ ...l, tasks: l.tasks.map((t) => t.id === task.id ? task : t) })));
    const onTaskDeleted = ({ id: taskId }) => setLists((prev) => prev.map((l) => ({ ...l, tasks: l.tasks.filter((t) => t.id !== taskId) })));
    const onTaskMoved = () => loadBoard();
    const onListCreated = (list) => setLists((prev) => [...prev, list]);
    const onListRenamed = ({ id: listId, name }) => setLists((prev) => prev.map((l) => l.id === listId ? { ...l, name } : l));
    const onListDeleted = ({ id: listId }) => setLists((prev) => prev.filter((l) => l.id !== listId));
    const onCommentAdded = () => loadBoard();

    socket.on('task_created', onTaskCreated);
    socket.on('task_updated', onTaskUpdated);
    socket.on('task_deleted', onTaskDeleted);
    socket.on('task_moved', onTaskMoved);
    socket.on('list_created', onListCreated);
    socket.on('list_renamed', onListRenamed);
    socket.on('list_deleted', onListDeleted);
    socket.on('comment_added', onCommentAdded);

    return () => {
      socket.emit('leave_project', id);
      socket.off('task_created', onTaskCreated);
      socket.off('task_updated', onTaskUpdated);
      socket.off('task_deleted', onTaskDeleted);
      socket.off('task_moved', onTaskMoved);
      socket.off('list_created', onListCreated);
      socket.off('list_renamed', onListRenamed);
      socket.off('list_deleted', onListDeleted);
      socket.off('comment_added', onCommentAdded);
    };
  }, [socket, id, loadBoard]);

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromListId', task.list_id);
  };

  const handleDrop = async (e, listId) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData('taskId'));
    const fromListId = Number(e.dataTransfer.getData('fromListId'));

    const targetList = lists.find((l) => l.id === listId);
    const position = targetList.tasks.length;

    setLists((prev) =>
      prev.map((l) => {
        if (l.id === fromListId && l.id !== listId) {
          return { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) };
        }
        if (l.id === listId) {
          const task = lists.find((x) => x.id === fromListId)?.tasks.find((t) => t.id === taskId);
          if (task && !l.tasks.some((t) => t.id === taskId)) {
            return { ...l, tasks: [...l.tasks, { ...task, list_id: listId }] };
          }
        }
        return l;
      })
    );

    try {
      await api(`/tasks/${taskId}/move`, { method: 'PUT', token, body: { listId, position } });
    } catch (err) {
      notify(err.message, 'error');
      loadBoard();
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      await api('/lists', { method: 'POST', token, body: { projectId: id, name: newListName.trim() } });
      setNewListName('');
      setAddingListFor(false);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const createTask = async (e, listId) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await api('/tasks', { method: 'POST', token, body: { listId, projectId: id, title: newTaskTitle.trim() } });
      setNewTaskTitle('');
      setAddingTaskFor(null);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const deleteList = async (listId) => {
    if (!window.confirm('Delete this list and all its tasks?')) return;
    try {
      await api(`/lists/${listId}`, { method: 'DELETE', token });
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const invite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      const data = await api(`/projects/${id}/invite`, { method: 'POST', token, body: { email: inviteEmail.trim() } });
      notify(data.message);
      setInviteEmail('');
      const updated = await api(`/projects/${id}`, { token });
      setProject(updated);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

    const deleteProject = async () => {
    if (!window.confirm(`Delete "${project.name}"? This removes all lists, tasks and comments permanently.`)) return;
    try {
      await api(`/projects/${id}`, { method: 'DELETE', token });
      notify('Project deleted');
      navigate('/');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  if (loading || !project) return <p>Loading...</p>;

  return (
    <div className="board-layout">
      <div className="board-head">
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>{project.name}</h1>
          <p style={{ color: 'var(--muted)' }}>{project.description}</p>
        </div>
        <div className="row">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowMembers((prev) => !prev)}>
            Members ({project.members.length})
          </button>
          {project.myRole === 'owner' && (
            <button className="btn btn-danger btn-sm" onClick={deleteProject}>Delete project</button>
          )}
        </div>
      </div>

      {showMembers && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="member-list">
            {project.members.map((m) => (
              <span key={m.id} className="member-chip">{m.name}{m.role === 'owner' ? ' (Owner)' : ''}</span>
            ))}
          </div>
          {project.myRole === 'owner' && (
            <form className="row" style={{ marginTop: 12 }} onSubmit={invite}>
              <input className="input" placeholder="Invite by email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              <button className="btn btn-sm">Invite</button>
            </form>
          )}
        </div>
      )}

      <div className="board">
        {lists.map((list) => (
          <div key={list.id} className="board-list" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, list.id)}>
            <div className="list-head">
              <strong>{list.name}</strong>
              <span className="list-count">{list.tasks.length}</span>
              {project.myRole === 'owner' && (
                <button className="icon-btn" onClick={() => deleteList(list.id)}>×</button>
              )}
            </div>

            <div className="list-tasks">
              {list.tasks.map((task) => (
                <TaskCard key={task.id} task={task} onDragStart={handleDragStart} onClick={() => setActiveTask(task)} />
              ))}
            </div>

            {addingTaskFor === list.id ? (
              <form className="add-task-form" onSubmit={(e) => createTask(e, list.id)}>
                <input
                  className="input"
                  placeholder="Task title"
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onBlur={() => !newTaskTitle.trim() && setAddingTaskFor(null)}
                />
                <button className="btn btn-sm">Add</button>
              </form>
            ) : (
              <button className="add-task-btn" onClick={() => setAddingTaskFor(list.id)}>+ Add task</button>
            )}
          </div>
        ))}

        <div className="board-list add-list">
          {addingListFor ? (
            <form onSubmit={createList}>
              <input
                className="input"
                placeholder="List name"
                autoFocus
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onBlur={() => !newListName.trim() && setAddingListFor(false)}
              />
              <button className="btn btn-sm" style={{ marginTop: 8 }}>Add list</button>
            </form>
          ) : (
            <button className="add-task-btn" onClick={() => setAddingListFor(true)}>+ Add another list</button>
          )}
        </div>
      </div>

      {activeTask && (
        <TaskModal
          task={activeTask}
          members={project.members}
          onClose={() => setActiveTask(null)}
          onUpdated={loadBoard}
          onDeleted={loadBoard}
        />
      )}
    </div>
  );
}