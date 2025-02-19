import { useContext, useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { socket } from "@/src/lib/socket";
import { Button } from "@/src/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/Dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/src/components/ui/Form";
import { Input } from "@/src/components/ui/Input";
import AppContext from "../lib/AppContext";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { joinGameSchema } from "../lib/validations/JoinGame";



type JoinGameForm = z.infer<typeof joinGameSchema>

export default function JoinGame() {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { state, setStatus, setOutcome, setStake, setChoice, setUsername, setGameId, setMembers } =
    useContext(AppContext);
  setStatus(0);
  setOutcome("unknown");
  setStake(0);
  setChoice(0);

  const form = useForm<JoinGameForm>({
    resolver: zodResolver(joinGameSchema),
    defaultValues: {
      username: '',
      gameId: '',
    },
  })

  useEffect(() => {
    function handleGameJoined(data: any) {
      setMembers(data.members);
      setIsLoading(false);
      navigate("/game-room");
    }

    function handleErrorMessage({ message }: { message: string }) {
      toast.error("Game Not Found", {
        description: message,
        position: "top-right",
        duration: 5000,
        dismissible: true,
      });
      setIsLoading(false);
    }

    function handleRoomFull({ message }: { message: string }) {
      toast.error("Room Full", {
        description: message,
        position: "top-right",
        duration: 5000,
        dismissible: true,
      });
      setIsLoading(false);
    }

    socket.on("game-joined", handleGameJoined);
    socket.on("game-not-found", ({ message }) => handleErrorMessage({ message }));
    socket.on("room-full", ({ message }) => handleRoomFull({ message }));

    return () => {
      socket.off("game-joined");
      socket.off("game-not-found");
      socket.off("room-full");
    };
  }, [navigate, setMembers]);

  function onSubmit({ gameId, username }: JoinGameForm) {
    setIsLoading(true);
    setUsername(username);
    setGameId(gameId);
    socket.emit("join-room", { gameId, username }, { address, p1: false });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!isConnected} variant="outline" className="w-full">
          Join Game
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[90vw] max-w-[400px]">
        <DialogHeader className="pb-2">
          <DialogTitle>Join a room now!</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gameId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Room ID" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button disabled={state.members.length === 2} type="submit" className="mt-2 bg-black">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
