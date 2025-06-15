import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
}

export interface SearchFilters {
  skills?: string[];
  status?: 'active' | 'planning' | 'completed';
  seniority?: 'junior' | 'mid' | 'senior';
  availability?: number;
}

export default function SearchBar({ onSearch, placeholder = 'Search...', showFilters = true }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const commonSkills = [
    'React',
    'Node.js',
    'Python',
    'Java',
    'TypeScript',
    'AWS',
    'Docker',
  ];

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleSkillSelect = (skill: string) => {
    const updatedSkills = [...(filters.skills || []), skill];
    setSelectedSkills(updatedSkills);
    setFilters({ ...filters, skills: updatedSkills });
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(updatedSkills);
    setFilters({ ...filters, skills: updatedSkills });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {showFilters && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1"
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Select
              onValueChange={(value) => handleSkillSelect(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Add skill" />
              </SelectTrigger>
              <SelectContent>
                {commonSkills.map((skill) => (
                  <SelectItem
                    key={skill}
                    value={skill}
                    disabled={selectedSkills.includes(skill)}
                  >
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => 
                setFilters({ ...filters, status: value as 'active' | 'planning' | 'completed' })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => 
                setFilters({ ...filters, seniority: value as 'junior' | 'mid' | 'senior' })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seniority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid">Mid-Level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => 
                setFilters({ ...filters, availability: parseInt(value) })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25%+ Available</SelectItem>
                <SelectItem value="50">50%+ Available</SelectItem>
                <SelectItem value="75">75%+ Available</SelectItem>
                <SelectItem value="100">100% Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
} 