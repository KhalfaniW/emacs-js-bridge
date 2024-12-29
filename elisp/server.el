(defvar elisp-server-port 5999
  "Port on which the Elisp server listens.")

(defvar elisp-server-process nil
  "Process object for the Elisp server.")

(defun start-elisp-server (&optional port)
  "Start a simple Elisp server that listens on PORT.
If PORT is not specified, use `elisp-server-port`."
  (setq elisp-server-process
        (make-network-process
         :name "elisp-server"
         :buffer "*elisp-server*"
         :family 'ipv4
         :service (or port elisp-server-port)
         :filter 'elisp-server-filter
         :server t))
  (message "Elisp server started on port %d" (or port elisp-server-port)))

(defun stop-elisp-server ()
  "Stop the Elisp server."
  (when elisp-server-process
    (delete-process elisp-server-process)
    (setq elisp-server-process nil)
    (message "Elisp server stopped")))

(defun elisp-server-filter (proc string)
  "Process incoming requests and send back the evaluation result."
  (message "Received: %s" string)
  (let ((result (condition-case err
                    (eval (car (read-from-string string)))
                  (error (format "Error: %s" err)))))
    (message "Sending: %s" result)
    (process-send-string proc (format "%s" result))))

;; Start the server on the default port
(start-elisp-server)
;; (stop-elisp-server) (buffer-list)
