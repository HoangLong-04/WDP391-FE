import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";

function DialogModal({
  open,
  onClose,
  title,
  onUpdate,
  onDelete,
  children,
  loading,
  submit,
  isEdit,
  onCreate
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: theme.spacing(1.5),
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, borderBottom: "1px solid #eee" }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          {title}
        </Typography>

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box component="div" className="space-y-4">
          {loading ? "Loading..." : children}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {isEdit && (
          <Button
          disabled={submit}
            onClick={onDelete}
            variant="outlined"
            color="error"
            sx={{ mr: "auto" }}
          >
            Delete
          </Button>
        )}

        <Button onClick={onClose} variant="text" color="inherit">
          Cancel
        </Button>
        {isEdit ? (
          <Button
            disabled={submit}
            onClick={onUpdate}
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        ) : (
          <Button
            disabled={submit}
            onClick={onCreate}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default DialogModal;
