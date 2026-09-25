package com.consistency.backend.service;

import com.consistency.backend.entity.Task;
import com.consistency.backend.entity.TaskStatus;
import com.consistency.backend.entity.User;
import com.consistency.backend.exception.ResourceNotFoundException;
import com.consistency.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final CurrentUserService currentUserService;

    public TaskService(TaskRepository taskRepository, CurrentUserService currentUserService) {
        this.taskRepository = taskRepository;
        this.currentUserService = currentUserService;
    }

    public List<Task> getTasksByDate(LocalDate date) {
        User user = currentUserService.getCurrentUser();
        return taskRepository.findByUserIdAndPlannedDateOrderByCreatedTimeAsc(user.getId(), date);
    }

    public Task createTask(Task task) {
        User user = currentUserService.getCurrentUser();
        task.setUser(user);
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task taskDetails) {
        User user = currentUserService.getCurrentUser();
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));

        task.setTitle(taskDetails.getTitle());
        task.setPlannedDate(taskDetails.getPlannedDate());

        return taskRepository.save(task);
    }

    public Task updateTaskStatus(Long id, TaskStatus status) {
        User user = currentUserService.getCurrentUser();
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
        task.setStatus(status);
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        User user = currentUserService.getCurrentUser();
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
        taskRepository.delete(task);
    }

    public Map<String, Object> getDailySummary(LocalDate date) {
        List<Task> tasks = getTasksByDate(date);
        
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        
        double completionPercentage = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0.0;
        
        return Map.of(
            "totalTasks", totalTasks,
            "completedTasks", completedTasks,
            "completionPercentage", Math.round(completionPercentage)
        );
    }
}
