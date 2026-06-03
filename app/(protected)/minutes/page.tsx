"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPublicMeetingMinutes, type MeetingMinute, type MeetingMinuteListResponse } from "@/lib/api/meetings.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck, Calendar, Building2, User, Users, UserPlus,
  ListChecks, Clock, ChevronLeft, Loader2, AlertCircle, MapPin,
} from "lucide-react";

export default function PublicMinutesPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MeetingMinute | null>(null);

  const { data, isLoading, error } = useQuery<MeetingMinuteListResponse>({
    queryKey: ["meetings", "public", { page }],
    queryFn: () => listPublicMeetingMinutes({ page, limit: 15 }),
  });

  const minutes = data?.minutes || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  if (selected) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
          <ChevronLeft className="w-4 h-4 mr-1" />Back to Minutes
        </Button>

        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-bold">{selected.title}</h2>
            <Badge>Published</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground block text-xs mb-1">Date</span>{new Date(selected.date).toLocaleDateString()}</div>
            {selected.location && <div><span className="text-muted-foreground block text-xs mb-1">Location</span>{selected.location}</div>}
            <div><span className="text-muted-foreground block text-xs mb-1">Department</span>{selected.department?.name}</div>
            <div><span className="text-muted-foreground block text-xs mb-1">Recorded by</span>{selected.author?.name}</div>
          </div>

          {selected.publishedAt && (
            <p className="text-xs text-muted-foreground"><Clock className="w-3 h-3 inline mr-1" />Published {new Date(selected.publishedAt).toLocaleString()}</p>
          )}

          {/* Attendees */}
          {(selected.attendees?.length > 0 || selected.externalAttendees?.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Users className="w-4 h-4" />Attendees</h3>
              <div className="flex flex-wrap gap-2">
                {selected.attendees?.map((a) => (
                  <Badge key={a._id} variant="secondary" className="text-xs"><User className="w-3 h-3 mr-1" />{a.name}</Badge>
                ))}
                {selected.externalAttendees?.map((a, i) => (
                  <Badge key={i} variant="outline" className="text-xs"><UserPlus className="w-3 h-3 mr-1" />{a.name}{a.organization ? ` (${a.organization})` : ""}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Agenda */}
          {selected.agenda?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Agenda</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                {selected.agenda.map((item, i) => <li key={i}>{item}</li>)}
              </ol>
            </div>
          )}

          {/* Content */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Minutes</h3>
            <div
              className="prose prose-sm max-w-none [&_[data-text-size='h1']]:text-[1.75rem] [&_[data-text-size='h1']]:font-bold [&_[data-text-size='h2']]:text-[1.35rem] [&_[data-text-size='h2']]:font-semibold [&_[data-text-size='h3']]:text-[1.125rem] [&_[data-text-size='h3']]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li>p]:m-0"
              dangerouslySetInnerHTML={{ __html: selected.content }}
            />
          </div>

          {/* Action Items */}
          {selected.actionItems?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><ListChecks className="w-4 h-4" />Action Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50"><tr>
                    <th className="text-left px-3 py-2 font-medium">Task</th>
                    <th className="text-left px-3 py-2 font-medium">Assignee</th>
                    <th className="text-left px-3 py-2 font-medium">Due Date</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                  </tr></thead>
                  <tbody>{selected.actionItems.map((ai) => (
                    <tr key={ai._id} className="border-t">
                      <td className="px-3 py-2">{ai.task}</td>
                      <td className="px-3 py-2">{ai.assignee?.name}</td>
                      <td className="px-3 py-2">{ai.dueDate ? new Date(ai.dueDate).toLocaleDateString() : "—"}</td>
                      <td className="px-3 py-2">
                        <Badge variant={ai.status === "done" ? "default" : ai.status === "in-progress" ? "secondary" : "outline"} className="text-[10px]">
                          {ai.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10"><CalendarCheck className="w-5 h-5 text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold">Meeting Minutes</h1>
          <p className="text-sm text-muted-foreground">Published minutes from your department</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : error ? (
        <Card className="p-6 text-center text-red-600"><AlertCircle className="w-5 h-5 mx-auto mb-2" />Failed to load minutes</Card>
      ) : minutes.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No meeting minutes available for your department</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {minutes.map((m) => (
            <Card key={m._id} className="p-4 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all" onClick={() => setSelected(m)}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate mb-1">{m.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(m.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{m.department?.name}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{m.author?.name}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(m.attendees?.length || 0) + (m.externalAttendees?.length || 0)}</span>
                  </div>
                </div>
                {m.actionItems?.length > 0 && (
                  <Badge variant="outline" className="text-[10px] shrink-0"><ListChecks className="w-3 h-3 mr-1" />{m.actionItems.length}</Badge>
                )}
              </div>
            </Card>
          ))}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground py-2">Page {page} of {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
