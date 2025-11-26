const express = require('express');
const { query } = require('../db/database');

const router = express.Router();

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};

// Obtener tareas del usuario
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.session.userId]
    );
    res.json({ tasks: result.rows });
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({ error: 'Error obteniendo tareas' });
  }
});

// Crear tarea
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    const result = await query(
      'INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
      [req.session.userId, title, description || '']
    );

    res.json({ success: true, task: result.rows[0] });
  } catch (error) {
    console.error('Error creando tarea:', error);
    res.status(500).json({ error: 'Error creando tarea' });
  }
});

// Actualizar tarea
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Verificar que la tarea pertenece al usuario
    const taskResult = await query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const result = await query(
      'UPDATE tasks SET title = $1, description = $2, status = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [title || taskResult.rows[0].title, description || taskResult.rows[0].description, status || taskResult.rows[0].status, id]
    );

    res.json({ success: true, task: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    res.status(500).json({ error: 'Error actualizando tarea' });
  }
});

// Eliminar tarea
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la tarea pertenece al usuario
    const taskResult = await query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    await query('DELETE FROM tasks WHERE id = $1', [id]);

    res.json({ success: true, message: 'Tarea eliminada' });
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    res.status(500).json({ error: 'Error eliminando tarea' });
  }
});

module.exports = router;
