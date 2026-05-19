package com.example.DoantotnghiepIJ.service;



import com.example.DoantotnghiepIJ.dto.permission.PermissionRequest;
import com.example.DoantotnghiepIJ.dto.permission.PermissionResponse;
import com.example.DoantotnghiepIJ.entity.Permission;
import com.example.DoantotnghiepIJ.mapper.PermissionMapper;
import com.example.DoantotnghiepIJ.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository repository;

    // GET ALL
    public List<PermissionResponse> getAll() {
        return repository.findAllByIsDeletedFalse()
                .stream()
                .map(PermissionMapper::toResponse)
                .toList();
    }

    // GET BY ID
    public PermissionResponse getById(UUID id) {
        Permission permission = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        return PermissionMapper.toResponse(permission);
    }

    // CREATE
    public PermissionResponse create(PermissionRequest request) {

        repository.findByCodeAndIsDeletedFalse(request.getCode())
                .ifPresent(p -> {
                    throw new RuntimeException("Permission code already exists");
                });

        Permission permission = PermissionMapper.toEntity(request);

        return PermissionMapper.toResponse(repository.save(permission));
    }

    // UPDATE
    public PermissionResponse update(UUID id, PermissionRequest request) {

        Permission permission = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        PermissionMapper.update(permission, request);

        return PermissionMapper.toResponse(repository.save(permission));
    }

    // DELETE (SOFT DELETE)
    public void delete(UUID id) {
        Permission permission = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        permission.setIsDeleted(true);
        repository.save(permission);
    }

    // GROUPED BY MODULE
    public Map<String, List<PermissionResponse>> getGroupedByModule() {

        return repository.findAllByIsDeletedFalseOrderByModule()
                .stream()
                .map(PermissionMapper::toResponse)
                .collect(Collectors.groupingBy(
                        p -> p.getModule() == null ? "OTHER" : p.getModule()
                ));
    }
}