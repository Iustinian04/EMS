using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using EMS.Core.Entities;

namespace EMS.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IRepository<Category> _repository;
        public CategoryService(IRepository<Category> repository) => _repository = repository;

        public async Task<IEnumerable<CategoryDTO>> GetAllAsync()
        {
            var categories = await _repository.GetAllAsync();
            return categories.Select(c => new CategoryDTO { Id = c.Id, Name = c.Name });
        }

        public async Task<CategoryDTO> CreateAsync(string name)
        {
            var category = new Category { Name = name };
            await _repository.AddAsync(category);
            await _repository.SaveAsync();
            return new CategoryDTO { Id = category.Id, Name = category.Name };
        }
    }
}
