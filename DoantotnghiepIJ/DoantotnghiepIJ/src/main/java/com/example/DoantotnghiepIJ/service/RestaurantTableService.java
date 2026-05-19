package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.dto.Table.RestaurantTableRequest;
import com.example.DoantotnghiepIJ.dto.Table.RestaurantTableResponse;
import com.example.DoantotnghiepIJ.entity.RestaurantTable;
import com.example.DoantotnghiepIJ.mapper.RestaurantTableMapper;
import com.example.DoantotnghiepIJ.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantTableService {

    private final RestaurantTableRepository repository;

    public List<RestaurantTableResponse> getAll() {
        return repository.findByIsDeletedFalse()
                .stream()
                .map(RestaurantTableMapper::toResponse)
                .collect(Collectors.toList());
    }

    public RestaurantTableResponse getById(UUID id) {
        RestaurantTable table = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found"));
        return RestaurantTableMapper.toResponse(table);
    }

    public RestaurantTableResponse create(RestaurantTableRequest request) {
        if (repository.existsByCode(request.getCode())) {
            throw new RuntimeException("Code already exists");
        }

        RestaurantTable table = RestaurantTableMapper.toEntity(request);
        return RestaurantTableMapper.toResponse(repository.save(table));
    }

    public RestaurantTableResponse update(UUID id, RestaurantTableRequest request) {
        RestaurantTable table = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        table.setName(request.getName());
        table.setCapacity(request.getCapacity());
        table.setNote(request.getNote());

        return RestaurantTableMapper.toResponse(repository.save(table));
    }

    public void delete(UUID id) {
        RestaurantTable table = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        table.setIsDeleted(true);
        repository.save(table);
    }
}