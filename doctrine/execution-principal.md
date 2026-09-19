# Execution Principal

Authentication and authorization are separate but must agree. An actor token proves who/what role is executing; an actor-bound authority envelope proves which exact capabilities that actor may exercise. A temporal execution principal is valid only when both trust domains verify at the same logical epoch, the authority subject matches the actor ID, and the authority role matches the authenticated actor role.
