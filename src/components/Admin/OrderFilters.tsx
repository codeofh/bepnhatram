import React from "react";
import { Search, Calendar, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { OrderStatus } from "@/types/order";
import { format } from "date-fns";

interface OrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

export function OrderFilters({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  applyFilters,
  resetFilters,
}: OrderFiltersProps) {
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "processing", label: "Đang chuẩn bị" },
    { value: "shipping", label: "Đang giao" },
    { value: "completed", label: "Đã hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setStartDate(undefined);
    setEndDate(undefined);
    resetFilters();
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-3">
        {/* Tìm kiếm */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm theo mã đơn, tên khách hàng hoặc SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Lọc theo trạng thái */}
        <div className="w-full md:w-48">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lọc theo ngày */}
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center truncate">
                  <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Từ ngày"}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center truncate">
                  <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Đến ngày"}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {searchTerm || selectedStatus !== "all" || startDate || endDate ? (
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="w-full"
          >
            <X className="mr-1 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        ) : (
          <div></div> // Empty div to maintain grid layout when no reset button
        )}
        <Button onClick={applyFilters} className="w-full">
          <Filter className="mr-2 h-4 w-4" />
          <span className="sm:inline hidden">Lọc đơn hàng</span>
          <span className="sm:hidden inline">Lọc</span>
        </Button>
      </div>
    </div>
  );
}
