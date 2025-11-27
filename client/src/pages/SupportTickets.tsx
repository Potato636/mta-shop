import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SupportTicketWithUser } from "@shared/schema";
import { format } from "date-fns";

const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  orderId: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function SupportTickets() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: tickets, isLoading } = useQuery<SupportTicketWithUser[]>({
    queryKey: ["/api/support-tickets"],
  });

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      message: "",
      orderId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const response = await apiRequest("POST", "/api/support-tickets", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ticket created",
        description: "Your support ticket has been created successfully.",
      });
      form.reset();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" data-testid="heading-support">Support Tickets</h2>
          <p className="text-muted-foreground">Manage customer support issues and delivery problems</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-ticket">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-new-ticket">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe your issue" {...field} data-testid="input-subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Provide details about your issue" {...field} data-testid="textarea-message" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Order (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Order ID" {...field} data-testid="input-order-id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit-ticket"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Ticket"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card data-testid="card-tickets-list">
        <CardHeader>
          <CardTitle>Your Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets && tickets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id} data-testid={`row-ticket-${ticket.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium" data-testid={`text-subject-${ticket.id}`}>
                            {ticket.subject}
                          </p>
                          <p className="text-sm text-muted-foreground">{ticket.message.slice(0, 50)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)} data-testid={`badge-status-${ticket.id}`}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(ticket.createdAt), "PPp")}</TableCell>
                      <TableCell>{format(new Date(ticket.updatedAt), "PPp")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No support tickets yet</p>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-ticket">
                Create your first ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
