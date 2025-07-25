import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, MapPin, Edit, Trash2 } from "lucide-react";
import { useEventLineup } from "@/hooks/useEventLineup";
import type { EventLineup } from "@/types/lineup";

interface LineupManagementProps {
  eventId: string;
}

export const LineupManagement: React.FC<LineupManagementProps> = ({ eventId }) => {
  const { lineup, addLineup, updateLineup, deleteLineup, isLoading } = useEventLineup(eventId);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    artist_name: "",
    start_time: "",
    end_time: "",
    stage_name: "",
    description: "",
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      artist_name: "",
      start_time: "",
      end_time: "",
      stage_name: "",
      description: "",
      display_order: 0,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateLineup({ id: editingId, ...formData });
    } else {
      addLineup({ 
        event_id: eventId, 
        ...formData,
        display_order: (lineup?.length || 0) + 1
      });
    }
    
    resetForm();
  };

  const handleEdit = (item: EventLineup) => {
    setFormData({
      artist_name: item.artist_name,
      start_time: item.start_time,
      end_time: item.end_time,
      stage_name: item.stage_name || "",
      description: item.description || "",
      display_order: item.display_order,
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return <div>Loading lineup...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Lineup</h2>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" />
          Add Performer
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Performer" : "Add Performer"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artist_name">Artist/Performer Name *</Label>
                  <Input
                    id="artist_name"
                    value={formData.artist_name}
                    onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stage_name">Stage Name</Label>
                  <Input
                    id="stage_name"
                    value={formData.stage_name}
                    onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
                    placeholder="Main Stage, Side Stage, etc."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Performance Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the performance..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Update" : "Add"} Performer
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lineup List */}
      <div className="space-y-4">
        {lineup?.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No performers added yet. Click "Add Performer" to get started.
            </CardContent>
          </Card>
        ) : (
          lineup?.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{item.artist_name}</h3>
                      {item.stage_name && (
                        <Badge variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.stage_name}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTime(item.start_time)} - {formatTime(item.end_time)}
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground max-w-2xl">
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteLineup(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};