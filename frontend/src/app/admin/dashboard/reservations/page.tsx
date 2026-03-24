"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Phone, Mail, CheckCircle, XCircle, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: number;
  reservationTime: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  createdAt: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("restsaas_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const response = await fetch(`${apiUrl}/api/reservations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("restsaas_token");
      const response = await fetch(`http://localhost:8080/api/reservations/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchReservations(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reservación?")) return;

    try {
      const token = localStorage.getItem("restsaas_token");
      const response = await fetch(`http://localhost:8080/api/reservations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchReservations(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("es-CR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("es-CR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Reservaciones</h1>
          <p className="text-foreground/60 mt-2">
            Gestiona las reservaciones de tu restaurante
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {reservations.filter(r => r.status === "Pending").length}
            </div>
            <div className="text-sm text-foreground/60">Pendientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {reservations.filter(r => r.status === "Confirmed").length}
            </div>
            <div className="text-sm text-foreground/60">Confirmadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {reservations.filter(r => r.status === "Completed").length}
            </div>
            <div className="text-sm text-foreground/60">Completadas</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reservations.length === 0 ? (
          <div className="text-center p-12 glass dark:glass-dark rounded-3xl border-2 border-dashed border-border/30">
            <Calendar className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
            <p className="text-foreground/50">No hay reservaciones aún.</p>
          </div>
        ) : (
          reservations.map((reservation) => {
            const { date, time } = formatDateTime(reservation.reservationTime);
            return (
              <div
                key={reservation.id}
                className="glass dark:glass-dark rounded-3xl p-6 border border-border/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold">{reservation.customerName}</h3>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusIcon(reservation.status)}
                        {reservation.status === "Pending" && "Pendiente"}
                        {reservation.status === "Confirmed" && "Confirmada"}
                        {reservation.status === "Cancelled" && "Cancelada"}
                        {reservation.status === "Completed" && "Completada"}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-foreground/60" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-foreground/60" />
                        <span>{time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-foreground/60" />
                        <span>{reservation.partySize} persona{reservation.partySize !== 1 ? "s" : ""}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-foreground/60">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <a
                          href={`tel:${reservation.customerPhone}`}
                          className="hover:text-primary transition-colors"
                        >
                          {reservation.customerPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${reservation.customerEmail}`}
                          className="hover:text-primary transition-colors"
                        >
                          {reservation.customerEmail}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {reservation.status === "Pending" && (
                      <>
                        <Button
                          onClick={() => updateReservationStatus(reservation.id, "Confirmed")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          Confirmar
                        </Button>
                        <Button
                          onClick={() => updateReservationStatus(reservation.id, "Cancelled")}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    {reservation.status === "Confirmed" && (
                      <Button
                        onClick={() => updateReservationStatus(reservation.id, "Completed")}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        Completar
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteReservation(reservation.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}