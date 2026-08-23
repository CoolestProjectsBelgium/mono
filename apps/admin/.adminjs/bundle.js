(function (React, designSystem, adminjs, styledComponents) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  // src/frontend/login.tsx
  const Login = () => {
    const [events, setEvents] = React.useState([]);
    const [selectedEvent, setEvent] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
      const fetchEvents = async () => {
        try {
          const response = await fetch('/api/events');
          const data = await response.json();
          setEvents(data);
          // Pre-select current event if available
          const currentEvent = data.find(e => e.isCurrent);
          setEvent(currentEvent || data[0]);
        } catch (error) {
          console.error('Failed to fetch events:', error);
          setEvents([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvents();
    }, []);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      margin: "auto",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      method: "POST",
      as: "form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H1, null, "Login"), /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        width: "400px"
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, {
      action: "login"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      htmlFor: "email"
    }, "Account"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "email",
      type: "text",
      variant: "default"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      htmlFor: "password"
    }, "Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "password",
      type: "password",
      variant: "default"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      htmlFor: "event"
    }, "Event"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "hidden",
      name: "event",
      value: selectedEvent?.value
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Select, {
      variant: "default",
      options: events,
      value: selectedEvent,
      onChange: setEvent,
      isLoading: isLoading,
      isDisabled: isLoading || events.length === 0
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      type: "submit"
    }, "Login")));
  };

  const api = new adminjs.ApiClient();

  // Props interface voor de gestylede Card component

  const pageHeaderHeight = 300;
  const pageHeaderPaddingY = 54;
  const pageHeaderPaddingX = 300;
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const DashboardHeader = () => {
    const [data, setData] = React.useState({});
    React.useEffect(() => {
      let isSubscribed = true;
      api.getDashboard().then(response => {
        console.log('dashboard.tsx_01', response);
        if (isSubscribed) {
          setData(response.data);
        }
      });
      return () => {
        isSubscribed = false;
      };
    }, []);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      position: "relative",
      overflow: "hidden"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "grey100",
      height: pageHeaderHeight,
      py: pageHeaderPaddingY,
      px: ['default', 'lg', pageHeaderPaddingX]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      textAlign: "center",
      color: "white"
    }, /*#__PURE__*/React__default.default.createElement("h2", {
      style: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '10px 0'
      }
    }, data.event_title), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, "starting on : ", ' ', data.officialStartDate !== undefined ? new Intl.DateTimeFormat('en-BE', options).format(new Date(data.officialStartDate)) : 'No event'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, data.days_remaining, " days remaining"))));
  };

  // Volledig getypeerde Styled Component
  const Card = styledComponents.styled(designSystem.Box)`
  display: ${({
  flex
}) => flex ? 'flex' : 'block'};
  color: ${({
  theme
}) => theme.colors.grey100};
  height: 100%;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: ${({
  theme
}) => theme.space.md};
  transition: all 0.1s ease-in;

  &:hover {
    border: 1px solid ${({
  theme
}) => theme.colors.primary60};
    box-shadow: ${({
  theme
}) => theme.shadows.cardHover};
  }

  & .dsc-icon svg, .gh-icon svg {
    width: 64px;
    height: 64px;
  }
`;
  Card.defaultProps = {
    variant: 'container',
    boxShadow: 'card'
  };
  const Dashboard = () => {
    const [data, setData] = React.useState({});
    React.useEffect(() => {
      let isSubscribed = true;
      api.getDashboard().then(response => {
        if (isSubscribed) {
          setData(response.data);
        }
      });
      return () => {
        isSubscribed = false;
      };
    }, []);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, /*#__PURE__*/React__default.default.createElement(DashboardHeader, null), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: ['xl', 'xl', '-100px'],
      mb: "xl",
      mx: [0, 0, 0, 'auto'],
      px: ['default', 'lg', 'xxl', '0'],
      position: "relative",
      flex: true,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignContent: "flex-start",
      width: [1, 1, 1, 1024]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Status Registrations"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.pending_users ?? 0, " Registrations Pending"), /*#__PURE__*/React__default.default.createElement("li", null, data.overdue_registration ?? 0, " Overdue registrations"), /*#__PURE__*/React__default.default.createElement("li", null, data.waiting_list ?? 0, " On waiting list"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_unusedVouchers ?? 0, " unused vouchers"))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Status Projects"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.total_projects ?? 0, "/", data.maxRegistration ?? 0, " Projects Remaining / with", ' ', data.total_usedVouchers ?? 0, " Co-Worker(s)"), /*#__PURE__*/React__default.default.createElement("li", null, (data.total_users || 0) - (data.total_usedVouchers || 0) - (data.total_projects || 0), " user(s) without Project"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_videos ?? 0, " Project(s) with foto/video confirmed"))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Statistics Users (total:", data.total_users ?? 0, ")"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "row",
      justifyContent: "space-between",
      position: "relative"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, "Languages"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_nl || 0, " nl"), /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_fr || 0, " fr"), /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_en || 0, " en"))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, "Sex"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.total_females || 0, " females"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_males || 0, " males"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_X || 0, " X"))))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl",
      width: "100%"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Answers controle list"), /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "total"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "short"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "description"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, data.questions && data.questions.map(question => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: question.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.total), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.short), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.description)))))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl",
      width: "100%"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "T-Shirts order list"), /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "total"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "short"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "description"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, data.tshirts && data.tshirts.map(tshirt => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: tshirt.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, tshirt.total), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, tshirt.short), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, tshirt.description))))))))));
  };

  const PictureHandlerPage = () => {
    const [data, setData] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [savingId, setSavingId] = React.useState(null);
    const api = new adminjs.ApiClient();
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.getPage({
          pageName: "PictureSelector"
        });
        setData(response.data);
      } catch (err) {
        console.error('Failed to load attachments:', err);
      } finally {
        setLoading(false);
      }
    };
    React.useEffect(() => {
      fetchData();
    }, []);

    // Update local state when toggled
    const handleToggle = (projectName, id, field) => {
      setData(prev => {
        const updatedGroup = prev[projectName].map(item => item.id === id ? {
          ...item,
          [field]: !item[field]
        } : item);
        return {
          ...prev,
          [projectName]: updatedGroup
        };
      });
    };

    // Save changes for a specific attachment
    const handleSave = async item => {
      setSavingId(item.id);
      try {
        // Sends update request to standard AdminJS record update handler
        await api.recordAction({
          resourceId: 'Attachments',
          // Replace with your exact Resource ID if different
          actionName: 'edit',
          recordId: String(item.id),
          data: {
            confirmed: item.confirmed,
            internal: item.internal
          }
        });
      } catch (err) {
        console.error(`Failed to update attachment ${item.id}:`, err);
      } finally {
        setSavingId(null);
      }
    };
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        padding: "xl"
      }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, "Loading thumbnails..."));
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      padding: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      variant: "h3",
      mb: "xl"
    }, "Project Attachments Overview"), Object.keys(data).length === 0 ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, "No attachments found for this event.") : Object.entries(data).map(([projectName, attachments]) => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: projectName,
      mb: "xxl",
      bg: "white",
      p: "lg",
      boxShadow: "card"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      variant: "primary",
      size: "lg",
      mb: "md"
    }, projectName), /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Thumbnail"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "Name"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      align: "center"
    }, "Internal"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      align: "center"
    }, "Confirmed"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      align: "right"
    }, "Actions"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, attachments.map(item => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: item.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      style: {
        width: '100px'
      }
    }, item.thumbnailPath ? /*#__PURE__*/React__default.default.createElement("img", {
      src: item.thumbnailPath,
      alt: item.name,
      style: {
        width: '80px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '4px'
      }
    }) : /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, "No Image")), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontweight: "bold"
    }, item.name)), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      align: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.CheckBox, {
      checked: item.internal,
      onChange: () => handleToggle(projectName, item.id, 'internal')
    })), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      align: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.CheckBox, {
      checked: item.confirmed,
      onChange: () => handleToggle(projectName, item.id, 'confirmed')
    })), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, {
      align: "right"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      size: "sm",
      variant: "contained",
      disabled: savingId === item.id,
      onClick: () => handleSave(item)
    }, savingId === item.id ? 'Saving...' : 'Save Flags')))))))));
  };

  const PasswordEdit = props => {
    const {
      onChange,
      property,
      record,
      resource
    } = props;
    const {
      translateButton: tb
    } = adminjs.useTranslation();
    const [showPassword, togglePassword] = React.useState(false);
    React.useEffect(() => {
      if (!showPassword) {
        onChange(property.name, '');
      }
    }, [onChange, showPassword]);
    // For new records always show the property
    if (!record.id) {
      return /*#__PURE__*/React__default.default.createElement(adminjs.BasePropertyComponent.Password.Edit, props);
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, showPassword && /*#__PURE__*/React__default.default.createElement(adminjs.BasePropertyComponent.Password.Edit, props), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      textAlign: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      onClick: () => togglePassword(!showPassword),
      type: "button"
    }, showPassword ? tb('cancel', resource.id) : tb('changePassword', resource.id)))));
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Login = Login;
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.PictureSelector = PictureHandlerPage;
  AdminJS.UserComponents.PasswordEditComponent = PasswordEdit;

})(React, AdminJSDesignSystem, AdminJS, styled);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvY29tcG9uZW50cy9sb2dpbi9Mb2dpbi50c3giLCIuLi9zcmMvY29tcG9uZW50cy9kYXNoYm9hcmQvRGFzaGJvYXJkLnRzeCIsIi4uL3NyYy9jb21wb25lbnRzL3BpY3R1cmVzL1BpY3R1cmVTZWxlY3Rvci50c3giLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQGFkbWluanMvcGFzc3dvcmRzL2J1aWxkL2NvbXBvbmVudHMvUGFzc3dvcmRFZGl0Q29tcG9uZW50LmpzeCIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHNyYy9mcm9udGVuZC9sb2dpbi50c3hcbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtcbiAgQm94LFxuICBCdXR0b24sXG4gIElucHV0LFxuICBMYWJlbCxcbiAgSDEsXG4gIFNlbGVjdCxcbiAgRm9ybUdyb3VwLFxufSBmcm9tIFwiQGFkbWluanMvZGVzaWduLXN5c3RlbVwiO1xuXG5jb25zdCBMb2dpbiA9ICgpID0+IHtcbiAgY29uc3QgW2V2ZW50cywgc2V0RXZlbnRzXSA9IHVzZVN0YXRlPGFueVtdPihbXSk7XG4gIGNvbnN0IFtzZWxlY3RlZEV2ZW50LCBzZXRFdmVudF0gPSB1c2VTdGF0ZTxhbnk+KG51bGwpO1xuICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBmZXRjaEV2ZW50cyA9IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy9hcGkvZXZlbnRzJyk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIHNldEV2ZW50cyhkYXRhKTtcbiAgICAgICAgLy8gUHJlLXNlbGVjdCBjdXJyZW50IGV2ZW50IGlmIGF2YWlsYWJsZVxuICAgICAgICBjb25zdCBjdXJyZW50RXZlbnQgPSBkYXRhLmZpbmQoKGU6IGFueSkgPT4gZS5pc0N1cnJlbnQpO1xuICAgICAgICBzZXRFdmVudChjdXJyZW50RXZlbnQgfHwgZGF0YVswXSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggZXZlbnRzOicsIGVycm9yKTtcbiAgICAgICAgc2V0RXZlbnRzKFtdKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBmZXRjaEV2ZW50cygpO1xuICB9LCBbXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBtYXJnaW49XCJhdXRvXCJcbiAgICAgIGhlaWdodD1cIjEwMHZoXCJcbiAgICAgIGRpc3BsYXk9XCJmbGV4XCJcbiAgICAgIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiXG4gICAgICBtZXRob2Q9XCJQT1NUXCIgYXM9XCJmb3JtXCJcbiAgICA+XG4gICAgICA8SDE+TG9naW48L0gxPlxuICAgICAgPHNlY3Rpb24gc3R5bGU9e3sgd2lkdGg6IFwiNDAwcHhcIiB9fT5cbiAgICAgICAgPEZvcm1Hcm91cCBhY3Rpb249XCJsb2dpblwiID5cbiAgICAgICAgICA8TGFiZWwgaHRtbEZvcj1cImVtYWlsXCI+QWNjb3VudDwvTGFiZWw+XG4gICAgICAgICAgPElucHV0IG5hbWU9XCJlbWFpbFwiIHR5cGU9XCJ0ZXh0XCIgdmFyaWFudD1cImRlZmF1bHRcIiAvPlxuICAgICAgICAgIDxMYWJlbCBodG1sRm9yPVwicGFzc3dvcmRcIj5QYXNzd29yZDwvTGFiZWw+XG4gICAgICAgICAgPElucHV0IG5hbWU9XCJwYXNzd29yZFwiIHR5cGU9XCJwYXNzd29yZFwiIHZhcmlhbnQ9XCJkZWZhdWx0XCIgLz5cbiAgICAgICAgICA8TGFiZWwgaHRtbEZvcj1cImV2ZW50XCI+RXZlbnQ8L0xhYmVsPlxuICAgICAgICAgIDxJbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cImV2ZW50XCIgdmFsdWU9e3NlbGVjdGVkRXZlbnQ/LnZhbHVlfSAvPlxuICAgICAgICAgIDxTZWxlY3QgXG4gICAgICAgICAgICB2YXJpYW50PVwiZGVmYXVsdFwiIFxuICAgICAgICAgICAgb3B0aW9ucz17ZXZlbnRzfSBcbiAgICAgICAgICAgIHZhbHVlPXtzZWxlY3RlZEV2ZW50fSBcbiAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRFdmVudH1cbiAgICAgICAgICAgIGlzTG9hZGluZz17aXNMb2FkaW5nfVxuICAgICAgICAgICAgaXNEaXNhYmxlZD17aXNMb2FkaW5nIHx8IGV2ZW50cy5sZW5ndGggPT09IDB9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Gb3JtR3JvdXA+XG4gICAgICAgIDxCdXR0b24gdmFyaWFudD1cInByaW1hcnlcIiB0eXBlPVwic3VibWl0XCI+TG9naW48L0J1dHRvbj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8L0JveD5cbiAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IExvZ2luO1xuIiwiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEFwaUNsaWVudCB9IGZyb20gJ2FkbWluanMnXG5pbXBvcnQgeyBEYXNoYm9hcmRSZXNwb25zZSB9IGZyb20gJy4vaGFuZGxlci5qcydcblxuaW1wb3J0IHtcbiAgICBCb3gsXG4gICAgSDQsXG4gICAgSDUsXG4gICAgVGFibGUsXG4gICAgVGFibGVSb3csXG4gICAgVGFibGVCb2R5LFxuICAgIFRhYmxlQ2VsbCxcbiAgICBUYWJsZUhlYWQsXG4gICAgVGV4dFxufSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgc3R5bGVkIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbS9zdHlsZWQtY29tcG9uZW50cydcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpXG5cblxuLy8gUHJvcHMgaW50ZXJmYWNlIHZvb3IgZGUgZ2VzdHlsZWRlIENhcmQgY29tcG9uZW50XG5pbnRlcmZhY2UgQ2FyZFByb3BzIHtcbiAgICBmbGV4PzogYm9vbGVhblxufVxuXG5jb25zdCBwYWdlSGVhZGVySGVpZ2h0ID0gMzAwXG5jb25zdCBwYWdlSGVhZGVyUGFkZGluZ1kgPSA1NFxuY29uc3QgcGFnZUhlYWRlclBhZGRpbmdYID0gMzAwXG5cbmNvbnN0IG9wdGlvbnM6IEludGwuRGF0ZVRpbWVGb3JtYXRPcHRpb25zID0ge1xuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBtb250aDogJzItZGlnaXQnLFxuICAgIGRheTogJzItZGlnaXQnXG59XG5cbmV4cG9ydCBjb25zdCBEYXNoYm9hcmRIZWFkZXI6IFJlYWN0LkZDID0gKCkgPT4ge1xuICAgIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlPERhc2hib2FyZFJlc3BvbnNlPih7fSBhcyBEYXNoYm9hcmRSZXNwb25zZSlcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxldCBpc1N1YnNjcmliZWQgPSB0cnVlXG4gICAgICAgIGFwaS5nZXREYXNoYm9hcmQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Rhc2hib2FyZC50c3hfMDEnLCByZXNwb25zZSlcbiAgICAgICAgICAgIGlmIChpc1N1YnNjcmliZWQpIHtcbiAgICAgICAgICAgICAgICBzZXREYXRhKHJlc3BvbnNlLmRhdGEgYXMgRGFzaGJvYXJkUmVzcG9uc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpc1N1YnNjcmliZWQgPSBmYWxzZVxuICAgICAgICB9XG4gICAgfSwgW10pXG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8Qm94IHBvc2l0aW9uPVwicmVsYXRpdmVcIiBvdmVyZmxvdz1cImhpZGRlblwiPlxuICAgICAgICAgICAgPEJveFxuICAgICAgICAgICAgICAgIGJnPVwiZ3JleTEwMFwiXG4gICAgICAgICAgICAgICAgaGVpZ2h0PXtwYWdlSGVhZGVySGVpZ2h0fVxuICAgICAgICAgICAgICAgIHB5PXtwYWdlSGVhZGVyUGFkZGluZ1l9XG4gICAgICAgICAgICAgICAgcHg9e1snZGVmYXVsdCcsICdsZycsIHBhZ2VIZWFkZXJQYWRkaW5nWF19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEJveCB0ZXh0QWxpZ249XCJjZW50ZXJcIiBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMiBzdHlsZT17eyBmb250U2l6ZTogJzMycHgnLCBmb250V2VpZ2h0OiAnYm9sZCcsIG1hcmdpbjogJzEwcHggMCcgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZGF0YS5ldmVudF90aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9oMj5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQ+c3RhcnRpbmcgb24gOiB7JyAnfVxuICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEub2ZmaWNpYWxTdGFydERhdGUgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLUJFJywgb3B0aW9ucykuZm9ybWF0KG5ldyBEYXRlKGRhdGEub2ZmaWNpYWxTdGFydERhdGUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ05vIGV2ZW50J31cbiAgICAgICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICAgICAgICA8VGV4dD57ZGF0YS5kYXlzX3JlbWFpbmluZ30gZGF5cyByZW1haW5pbmc8L1RleHQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgPC9Cb3g+XG4gICAgKVxufVxuXG4vLyBUeXBlIGRlZmluaXRpZSB2b29yIGRlIG5hdmlnYXRpZWJsb2trZW4gKGluZGllbiBqZSBkZXplIGxhdGVyIHdpbCByZW5kZXJlbilcbnR5cGUgQm94VHlwZSA9IHtcbiAgICB0aXRsZTogc3RyaW5nXG4gICAgc3VidGl0bGU6IHN0cmluZ1xuICAgIGhyZWY6IHN0cmluZ1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5jb25zdCBib3hlcyA9ICgpOiBBcnJheTxCb3hUeXBlPiA9PiBbXG4gICAge1xuICAgICAgICB0aXRsZTogXCJSZWdpc3RlclwiLFxuICAgICAgICBzdWJ0aXRsZTogXCJSZWdpc3RlciBvbiBiZWhhbGYgb2YgYSBwYXJ0aWNpcGFudFwiLFxuICAgICAgICBocmVmOiAnaHR0cHM6Ly9kb2NzLmFkbWluanMuY28vYmFzaWNzL3Jlc291cmNlI3Byb3ZpZGluZy1yZXNvdXJjZXMtZXhwbGljaXRseScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHRpdGxlOiBcIlVwbG9hZCBGb3RvXCIsXG4gICAgICAgIHN1YnRpdGxlOiBcIlVwbG9hZCBmb3RvcyBvbiBiZWhhbGYgb2YgYSBwYXJ0aWNpcGFudFwiLFxuICAgICAgICBocmVmOiAnaHR0cHM6Ly9kb2NzLmFkbWluanMuY28vYmFzaWNzL3Jlc291cmNlI3Byb3ZpZGluZy1yZXNvdXJjZXMtZXhwbGljaXRseScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHRpdGxlOiBcIlN0YXRpc3RpZWtOZXdcIixcbiAgICAgICAgc3VidGl0bGU6IFwiU2hvdyBzZXZlcmFsIHN0YXRpc3RpY3MgYWJvdXQgdGhlIGV2ZW50IE5ld1wiLFxuICAgICAgICBocmVmOiAnaHR0cHM6Ly9kb2NzLmFkbWluanMuY28vYmFzaWNzL3Jlc291cmNlI3Byb3ZpZGluZy1yZXNvdXJjZXMtZXhwbGljaXRseScsXG4gICAgfSxcbl1cblxuLy8gVm9sbGVkaWcgZ2V0eXBlZXJkZSBTdHlsZWQgQ29tcG9uZW50XG5jb25zdCBDYXJkID0gc3R5bGVkKEJveCkgPENhcmRQcm9wcz5gXG4gIGRpc3BsYXk6ICR7KHsgZmxleCB9KTogc3RyaW5nID0+IChmbGV4ID8gJ2ZsZXgnIDogJ2Jsb2NrJyl9O1xuICBjb2xvcjogJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5jb2xvcnMuZ3JleTEwMH07XG4gIGhlaWdodDogMTAwJTtcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICBib3JkZXI6IDFweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgYm9yZGVyLXJhZGl1czogJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5zcGFjZS5tZH07XG4gIHRyYW5zaXRpb246IGFsbCAwLjFzIGVhc2UtaW47XG5cbiAgJjpob3ZlciB7XG4gICAgYm9yZGVyOiAxcHggc29saWQgJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5jb2xvcnMucHJpbWFyeTYwfTtcbiAgICBib3gtc2hhZG93OiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLnNoYWRvd3MuY2FyZEhvdmVyfTtcbiAgfVxuXG4gICYgLmRzYy1pY29uIHN2ZywgLmdoLWljb24gc3ZnIHtcbiAgICB3aWR0aDogNjRweDtcbiAgICBoZWlnaHQ6IDY0cHg7XG4gIH1cbmBcblxuQ2FyZC5kZWZhdWx0UHJvcHMgPSB7XG4gICAgdmFyaWFudDogJ2NvbnRhaW5lcicsXG4gICAgYm94U2hhZG93OiAnY2FyZCcsXG59XG5cbmV4cG9ydCBjb25zdCBEYXNoYm9hcmQ6IFJlYWN0LkZDID0gKCkgPT4ge1xuICAgIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlPERhc2hib2FyZFJlc3BvbnNlPih7fSBhcyBEYXNoYm9hcmRSZXNwb25zZSlcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxldCBpc1N1YnNjcmliZWQgPSB0cnVlXG4gICAgICAgIGFwaS5nZXREYXNoYm9hcmQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzU3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgICAgIHNldERhdGEocmVzcG9uc2UuZGF0YSBhcyBEYXNoYm9hcmRSZXNwb25zZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGlzU3Vic2NyaWJlZCA9IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LCBbXSlcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxCb3g+XG4gICAgICAgICAgICA8RGFzaGJvYXJkSGVhZGVyIC8+XG4gICAgICAgICAgICA8Qm94XG4gICAgICAgICAgICAgICAgbXQ9e1sneGwnLCAneGwnLCAnLTEwMHB4J119XG4gICAgICAgICAgICAgICAgbWI9XCJ4bFwiXG4gICAgICAgICAgICAgICAgbXg9e1swLCAwLCAwLCAnYXV0byddfVxuICAgICAgICAgICAgICAgIHB4PXtbJ2RlZmF1bHQnLCAnbGcnLCAneHhsJywgJzAnXX1cbiAgICAgICAgICAgICAgICBwb3NpdGlvbj1cInJlbGF0aXZlXCJcbiAgICAgICAgICAgICAgICBmbGV4XG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbj1cInJvd1wiXG4gICAgICAgICAgICAgICAgZmxleFdyYXA9XCJ3cmFwXCJcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIlxuICAgICAgICAgICAgICAgIGFsaWduQ29udGVudD1cImZsZXgtc3RhcnRcIlxuICAgICAgICAgICAgICAgIHdpZHRoPXtbMSwgMSwgMSwgMTAyNF19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgey8qIDEuIFN0YXR1cyBSZWdpc3RyYXRpb25zICovfVxuICAgICAgICAgICAgICAgIDxCb3ggd2lkdGg9e1sxLCAxLCAxIC8gMl19IHA9XCJsZ1wiPlxuICAgICAgICAgICAgICAgICAgICA8Q2FyZCBhcz1cImFcIiBmbGV4PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJveCBtbD1cInhsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEg0PlN0YXR1cyBSZWdpc3RyYXRpb25zPC9IND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS5wZW5kaW5nX3VzZXJzID8/IDB9IFJlZ2lzdHJhdGlvbnMgUGVuZGluZzwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS5vdmVyZHVlX3JlZ2lzdHJhdGlvbiA/PyAwfSBPdmVyZHVlIHJlZ2lzdHJhdGlvbnM8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEud2FpdGluZ19saXN0ID8/IDB9IE9uIHdhaXRpbmcgbGlzdDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS50b3RhbF91bnVzZWRWb3VjaGVycyA/PyAwfSB1bnVzZWQgdm91Y2hlcnM8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICAgICAgIDwvQm94PlxuXG4gICAgICAgICAgICAgICAgey8qIDIuIFN0YXR1cyBQcm9qZWN0cyAqL31cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5TdGF0dXMgUHJvamVjdHM8L0g0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEudG90YWxfcHJvamVjdHMgPz8gMH0ve2RhdGEubWF4UmVnaXN0cmF0aW9uID8/IDB9IFByb2plY3RzIFJlbWFpbmluZyAvIHdpdGh7JyAnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEudG90YWxfdXNlZFZvdWNoZXJzID8/IDB9IENvLVdvcmtlcihzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7KChkYXRhLnRvdGFsX3VzZXJzIHx8IDApIC0gKGRhdGEudG90YWxfdXNlZFZvdWNoZXJzIHx8IDApIC0gKGRhdGEudG90YWxfcHJvamVjdHMgfHwgMCkpfSB1c2VyKHMpIHdpdGhvdXQgUHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudG90YWxfdmlkZW9zID8/IDB9IFByb2plY3Qocykgd2l0aCBmb3RvL3ZpZGVvIGNvbmZpcm1lZDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICAgICAgICB7LyogMy4gU3RhdGlzdGljcyBVc2VycyAqL31cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5TdGF0aXN0aWNzIFVzZXJzICh0b3RhbDp7ZGF0YS50b3RhbF91c2VycyA/PyAwfSk8L0g0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggZmxleCBmbGV4RGlyZWN0aW9uPVwicm93XCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgcG9zaXRpb249XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxINT5MYW5ndWFnZXM8L0g1PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS50bGFuZ19ubCB8fCAwfSBubDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRsYW5nX2ZyIHx8IDB9IGZyPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudGxhbmdfZW4gfHwgMH0gZW48L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggd2lkdGg9e1sxLCAxLCAxIC8gMl19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEg1PlNleDwvSDU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRvdGFsX2ZlbWFsZXMgfHwgMH0gZmVtYWxlczwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRvdGFsX21hbGVzIHx8IDB9IG1hbGVzPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudG90YWxfWCB8fCAwfSBYPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgICAgICAgIHsvKiA0LiBBbnN3ZXJzIFRhYmxlICovfVxuICAgICAgICAgICAgICAgIDxCb3ggd2lkdGg9e1sxLCAxLCAxXX0gcD1cImxnXCI+XG4gICAgICAgICAgICAgICAgICAgIDxDYXJkIGFzPVwiYVwiIGZsZXg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Qm94IG1sPVwieGxcIiB3aWR0aD1cIjEwMCVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SDQ+QW5zd2VycyBjb250cm9sZSBsaXN0PC9IND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD50b3RhbDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+c2hvcnQ8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPmRlc2NyaXB0aW9uPC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlSGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQm9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLnF1ZXN0aW9ucyAmJiBkYXRhLnF1ZXN0aW9ucy5tYXAoKHF1ZXN0aW9uKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlUm93IGtleT17cXVlc3Rpb24uaWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPntxdWVzdGlvbi50b3RhbH08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57cXVlc3Rpb24uc2hvcnR9PC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3F1ZXN0aW9uLmRlc2NyaXB0aW9ufTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICAgICAgICB7LyogNS4gVC1TaGlydHMgVGFibGUgKi99XG4gICAgICAgICAgICAgICAgPEJveCB3aWR0aD17WzEsIDEsIDFdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5ULVNoaXJ0cyBvcmRlciBsaXN0PC9IND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD50b3RhbDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+c2hvcnQ8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPmRlc2NyaXB0aW9uPC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlSGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQm9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLnRzaGlydHMgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRzaGlydHMubWFwKCh0c2hpcnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlUm93IGtleT17dHNoaXJ0LmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3RzaGlydC50b3RhbH08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3RzaGlydC5zaG9ydH08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3RzaGlydC5kZXNjcmlwdGlvbn08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZVJvdz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgPC9Cb3g+XG4gICAgKVxufVxuZXhwb3J0IGRlZmF1bHQgRGFzaGJvYXJkIiwiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBcGlDbGllbnQgfSBmcm9tICdhZG1pbmpzJztcblxuaW1wb3J0IHtcbiAgICBCb3gsXG4gICAgVGFibGUsXG4gICAgVGFibGVIZWFkLFxuICAgIFRhYmxlUm93LFxuICAgIFRhYmxlQ2VsbCxcbiAgICBUYWJsZUJvZHksXG4gICAgQ2hlY2tCb3gsXG4gICAgQnV0dG9uLFxuICAgIFRleHQsXG4gICAgQmFkZ2Vcbn0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5cbmltcG9ydCB7IEdyb3VwZWRBdHRhY2htZW50cywgUGljdHVyZUF0dGFjaG1lbnQgfSBmcm9tICcuLi9waWN0dXJlcy9oYW5kbGVyLmpzJ1xuXG5leHBvcnQgY29uc3QgUGljdHVyZUhhbmRsZXJQYWdlOiBSZWFjdC5GQyA9ICgpID0+IHtcbiAgICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZTxHcm91cGVkQXR0YWNobWVudHM+KHt9KTtcbiAgICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZTxib29sZWFuPih0cnVlKTtcbiAgICBjb25zdCBbc2F2aW5nSWQsIHNldFNhdmluZ0lkXSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KG51bGwpO1xuXG4gICAgY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG4gICAgY29uc3QgZmV0Y2hEYXRhID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRMb2FkaW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkuZ2V0UGFnZSh7IHBhZ2VOYW1lOiBcIlBpY3R1cmVTZWxlY3RvclwiIH0pO1xuICAgICAgICAgICAgc2V0RGF0YShyZXNwb25zZS5kYXRhIGFzIEdyb3VwZWRBdHRhY2htZW50cyk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBhdHRhY2htZW50czonLCBlcnIpO1xuXG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBmZXRjaERhdGEoKTtcbiAgICB9LCBbXSk7XG5cbiAgICAvLyBVcGRhdGUgbG9jYWwgc3RhdGUgd2hlbiB0b2dnbGVkXG4gICAgY29uc3QgaGFuZGxlVG9nZ2xlID0gKHByb2plY3ROYW1lOiBzdHJpbmcsIGlkOiBudW1iZXIsIGZpZWxkOiAnY29uZmlybWVkJyB8ICdpbnRlcm5hbCcpID0+IHtcbiAgICAgICAgc2V0RGF0YSgocHJldikgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlZEdyb3VwID0gcHJldltwcm9qZWN0TmFtZV0ubWFwKChpdGVtKSA9PlxuICAgICAgICAgICAgICAgIGl0ZW0uaWQgPT09IGlkID8geyAuLi5pdGVtLCBbZmllbGRdOiAhaXRlbVtmaWVsZF0gfSA6IGl0ZW1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4geyAuLi5wcmV2LCBbcHJvamVjdE5hbWVdOiB1cGRhdGVkR3JvdXAgfTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFNhdmUgY2hhbmdlcyBmb3IgYSBzcGVjaWZpYyBhdHRhY2htZW50XG4gICAgY29uc3QgaGFuZGxlU2F2ZSA9IGFzeW5jIChpdGVtOiBQaWN0dXJlQXR0YWNobWVudCkgPT4ge1xuICAgICAgICBzZXRTYXZpbmdJZChpdGVtLmlkKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFNlbmRzIHVwZGF0ZSByZXF1ZXN0IHRvIHN0YW5kYXJkIEFkbWluSlMgcmVjb3JkIHVwZGF0ZSBoYW5kbGVyXG4gICAgICAgICAgICBhd2FpdCBhcGkucmVjb3JkQWN0aW9uKHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZUlkOiAnQXR0YWNobWVudHMnLCAvLyBSZXBsYWNlIHdpdGggeW91ciBleGFjdCBSZXNvdXJjZSBJRCBpZiBkaWZmZXJlbnRcbiAgICAgICAgICAgICAgICBhY3Rpb25OYW1lOiAnZWRpdCcsXG4gICAgICAgICAgICAgICAgcmVjb3JkSWQ6IFN0cmluZyhpdGVtLmlkKSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpcm1lZDogaXRlbS5jb25maXJtZWQsXG4gICAgICAgICAgICAgICAgICAgIGludGVybmFsOiBpdGVtLmludGVybmFsLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gdXBkYXRlIGF0dGFjaG1lbnQgJHtpdGVtLmlkfTpgLCBlcnIpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0U2F2aW5nSWQobnVsbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKGxvYWRpbmcpIHtcbiAgICAgICAgcmV0dXJuIDxCb3ggcGFkZGluZz1cInhsXCI+PFRleHQ+TG9hZGluZyB0aHVtYm5haWxzLi4uPC9UZXh0PjwvQm94PjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8Qm94IHBhZGRpbmc9XCJ4bFwiPlxuICAgICAgICAgICAgPFRleHQgdmFyaWFudD1cImgzXCIgbWI9XCJ4bFwiPlByb2plY3QgQXR0YWNobWVudHMgT3ZlcnZpZXc8L1RleHQ+XG5cbiAgICAgICAgICAgIHtPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgPFRleHQ+Tm8gYXR0YWNobWVudHMgZm91bmQgZm9yIHRoaXMgZXZlbnQuPC9UZXh0PlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhkYXRhKS5tYXAoKFtwcm9qZWN0TmFtZSwgYXR0YWNobWVudHNdKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxCb3gga2V5PXtwcm9qZWN0TmFtZX0gbWI9XCJ4eGxcIiBiZz1cIndoaXRlXCIgcD1cImxnXCIgYm94U2hhZG93PVwiY2FyZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJhZGdlIHZhcmlhbnQ9XCJwcmltYXJ5XCIgc2l6ZT1cImxnXCIgbWI9XCJtZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtwcm9qZWN0TmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQmFkZ2U+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVIZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPlRodW1ibmFpbDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5OYW1lPC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIGFsaWduPVwiY2VudGVyXCI+SW50ZXJuYWw8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgYWxpZ249XCJjZW50ZXJcIj5Db25maXJtZWQ8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgYWxpZ249XCJyaWdodFwiPkFjdGlvbnM8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZVJvdz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlSGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVCb2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YXR0YWNobWVudHMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3cga2V5PXtpdGVtLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIHN0eWxlPXt7IHdpZHRoOiAnMTAwcHgnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aXRlbS50aHVtYm5haWxQYXRoID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17aXRlbS50aHVtYm5haWxQYXRofVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdD17aXRlbS5uYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnODBweCcsIGhlaWdodDogJzYwcHgnLCBvYmplY3RGaXQ6ICdjb3ZlcicsIGJvcmRlclJhZGl1czogJzRweCcgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPk5vIEltYWdlPC9UZXh0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVDZWxsPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRleHQgZm9udHdlaWdodD1cImJvbGRcIj57aXRlbS5uYW1lfTwvVGV4dD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlQ2VsbD5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGwgYWxpZ249XCJjZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENoZWNrQm94XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXtpdGVtLmludGVybmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eygpID0+IGhhbmRsZVRvZ2dsZShwcm9qZWN0TmFtZSwgaXRlbS5pZCwgJ2ludGVybmFsJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUNlbGw+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIGFsaWduPVwiY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDaGVja0JveFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17aXRlbS5jb25maXJtZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KCkgPT4gaGFuZGxlVG9nZ2xlKHByb2plY3ROYW1lLCBpdGVtLmlkLCAnY29uZmlybWVkJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUNlbGw+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsIGFsaWduPVwicmlnaHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3NhdmluZ0lkID09PSBpdGVtLmlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlU2F2ZShpdGVtKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3NhdmluZ0lkID09PSBpdGVtLmlkID8gJ1NhdmluZy4uLicgOiAnU2F2ZSBGbGFncyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZVJvdz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlPlxuICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgKX1cbiAgICAgICAgPC9Cb3g+XG4gICAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBpY3R1cmVIYW5kbGVyUGFnZTsiLCJpbXBvcnQgeyBCb3gsIEJ1dHRvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IHsgQmFzZVByb3BlcnR5Q29tcG9uZW50LCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5jb25zdCBQYXNzd29yZEVkaXQgPSAocHJvcHMpID0+IHtcbiAgICBjb25zdCB7IG9uQ2hhbmdlLCBwcm9wZXJ0eSwgcmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHM7XG4gICAgY29uc3QgeyB0cmFuc2xhdGVCdXR0b246IHRiIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuICAgIGNvbnN0IFtzaG93UGFzc3dvcmQsIHRvZ2dsZVBhc3N3b3JkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoIXNob3dQYXNzd29yZCkge1xuICAgICAgICAgICAgb25DaGFuZ2UocHJvcGVydHkubmFtZSwgJycpO1xuICAgICAgICB9XG4gICAgfSwgW29uQ2hhbmdlLCBzaG93UGFzc3dvcmRdKTtcbiAgICAvLyBGb3IgbmV3IHJlY29yZHMgYWx3YXlzIHNob3cgdGhlIHByb3BlcnR5XG4gICAgaWYgKCFyZWNvcmQuaWQpIHtcbiAgICAgICAgcmV0dXJuIDxCYXNlUHJvcGVydHlDb21wb25lbnQuUGFzc3dvcmQuRWRpdCB7Li4ucHJvcHN9Lz47XG4gICAgfVxuICAgIHJldHVybiAoPEJveD5cbiAgICAgIHtzaG93UGFzc3dvcmQgJiYgPEJhc2VQcm9wZXJ0eUNvbXBvbmVudC5QYXNzd29yZC5FZGl0IHsuLi5wcm9wc30vPn1cbiAgICAgIDxCb3ggbWI9XCJ4bFwiPlxuICAgICAgICA8VGV4dCB0ZXh0QWxpZ249XCJjZW50ZXJcIj5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHRvZ2dsZVBhc3N3b3JkKCFzaG93UGFzc3dvcmQpfSB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICB7c2hvd1Bhc3N3b3JkID8gdGIoJ2NhbmNlbCcsIHJlc291cmNlLmlkKSA6IHRiKCdjaGFuZ2VQYXNzd29yZCcsIHJlc291cmNlLmlkKX1cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+KTtcbn07XG5leHBvcnQgZGVmYXVsdCBQYXNzd29yZEVkaXQ7XG4iLCJBZG1pbkpTLlVzZXJDb21wb25lbnRzID0ge31cbmltcG9ydCBMb2dpbiBmcm9tICcuLi9zcmMvY29tcG9uZW50cy9sb2dpbi9Mb2dpbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTG9naW4gPSBMb2dpblxuaW1wb3J0IERhc2hib2FyZCBmcm9tICcuLi9zcmMvY29tcG9uZW50cy9kYXNoYm9hcmQvRGFzaGJvYXJkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5EYXNoYm9hcmQgPSBEYXNoYm9hcmRcbmltcG9ydCBQaWN0dXJlU2VsZWN0b3IgZnJvbSAnLi4vc3JjL2NvbXBvbmVudHMvcGljdHVyZXMvUGljdHVyZVNlbGVjdG9yJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5QaWN0dXJlU2VsZWN0b3IgPSBQaWN0dXJlU2VsZWN0b3JcbmltcG9ydCBQYXNzd29yZEVkaXRDb21wb25lbnQgZnJvbSAnLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BhZG1pbmpzL3Bhc3N3b3Jkcy9idWlsZC9jb21wb25lbnRzL1Bhc3N3b3JkRWRpdENvbXBvbmVudCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUGFzc3dvcmRFZGl0Q29tcG9uZW50ID0gUGFzc3dvcmRFZGl0Q29tcG9uZW50Il0sIm5hbWVzIjpbIkxvZ2luIiwiZXZlbnRzIiwic2V0RXZlbnRzIiwidXNlU3RhdGUiLCJzZWxlY3RlZEV2ZW50Iiwic2V0RXZlbnQiLCJpc0xvYWRpbmciLCJzZXRJc0xvYWRpbmciLCJ1c2VFZmZlY3QiLCJmZXRjaEV2ZW50cyIsInJlc3BvbnNlIiwiZmV0Y2giLCJkYXRhIiwianNvbiIsImN1cnJlbnRFdmVudCIsImZpbmQiLCJlIiwiaXNDdXJyZW50IiwiZXJyb3IiLCJjb25zb2xlIiwiUmVhY3QiLCJjcmVhdGVFbGVtZW50IiwiQm94IiwibWFyZ2luIiwiaGVpZ2h0IiwiZGlzcGxheSIsImZsZXhEaXJlY3Rpb24iLCJhbGlnbkl0ZW1zIiwianVzdGlmeUNvbnRlbnQiLCJtZXRob2QiLCJhcyIsIkgxIiwic3R5bGUiLCJ3aWR0aCIsIkZvcm1Hcm91cCIsImFjdGlvbiIsIkxhYmVsIiwiaHRtbEZvciIsIklucHV0IiwibmFtZSIsInR5cGUiLCJ2YXJpYW50IiwidmFsdWUiLCJTZWxlY3QiLCJvcHRpb25zIiwib25DaGFuZ2UiLCJpc0Rpc2FibGVkIiwibGVuZ3RoIiwiQnV0dG9uIiwiYXBpIiwiQXBpQ2xpZW50IiwicGFnZUhlYWRlckhlaWdodCIsInBhZ2VIZWFkZXJQYWRkaW5nWSIsInBhZ2VIZWFkZXJQYWRkaW5nWCIsInllYXIiLCJtb250aCIsImRheSIsIkRhc2hib2FyZEhlYWRlciIsInNldERhdGEiLCJpc1N1YnNjcmliZWQiLCJnZXREYXNoYm9hcmQiLCJ0aGVuIiwibG9nIiwicG9zaXRpb24iLCJvdmVyZmxvdyIsImJnIiwicHkiLCJweCIsInRleHRBbGlnbiIsImNvbG9yIiwiZm9udFNpemUiLCJmb250V2VpZ2h0IiwiZXZlbnRfdGl0bGUiLCJUZXh0Iiwib2ZmaWNpYWxTdGFydERhdGUiLCJ1bmRlZmluZWQiLCJJbnRsIiwiRGF0ZVRpbWVGb3JtYXQiLCJmb3JtYXQiLCJEYXRlIiwiZGF5c19yZW1haW5pbmciLCJDYXJkIiwic3R5bGVkIiwiZmxleCIsInRoZW1lIiwiY29sb3JzIiwiZ3JleTEwMCIsInNwYWNlIiwibWQiLCJwcmltYXJ5NjAiLCJzaGFkb3dzIiwiY2FyZEhvdmVyIiwiZGVmYXVsdFByb3BzIiwiYm94U2hhZG93IiwiRGFzaGJvYXJkIiwibXQiLCJtYiIsIm14IiwiZmxleFdyYXAiLCJhbGlnbkNvbnRlbnQiLCJwIiwibWwiLCJINCIsInBlbmRpbmdfdXNlcnMiLCJvdmVyZHVlX3JlZ2lzdHJhdGlvbiIsIndhaXRpbmdfbGlzdCIsInRvdGFsX3VudXNlZFZvdWNoZXJzIiwidG90YWxfcHJvamVjdHMiLCJtYXhSZWdpc3RyYXRpb24iLCJ0b3RhbF91c2VkVm91Y2hlcnMiLCJ0b3RhbF91c2VycyIsInRvdGFsX3ZpZGVvcyIsIkg1IiwidGxhbmdfbmwiLCJ0bGFuZ19mciIsInRsYW5nX2VuIiwidG90YWxfZmVtYWxlcyIsInRvdGFsX21hbGVzIiwidG90YWxfWCIsIlRhYmxlIiwiVGFibGVIZWFkIiwiVGFibGVSb3ciLCJUYWJsZUNlbGwiLCJUYWJsZUJvZHkiLCJxdWVzdGlvbnMiLCJtYXAiLCJxdWVzdGlvbiIsImtleSIsImlkIiwidG90YWwiLCJzaG9ydCIsImRlc2NyaXB0aW9uIiwidHNoaXJ0cyIsInRzaGlydCIsIlBpY3R1cmVIYW5kbGVyUGFnZSIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwic2F2aW5nSWQiLCJzZXRTYXZpbmdJZCIsImZldGNoRGF0YSIsImdldFBhZ2UiLCJwYWdlTmFtZSIsImVyciIsImhhbmRsZVRvZ2dsZSIsInByb2plY3ROYW1lIiwiZmllbGQiLCJwcmV2IiwidXBkYXRlZEdyb3VwIiwiaXRlbSIsImhhbmRsZVNhdmUiLCJyZWNvcmRBY3Rpb24iLCJyZXNvdXJjZUlkIiwiYWN0aW9uTmFtZSIsInJlY29yZElkIiwiU3RyaW5nIiwiY29uZmlybWVkIiwiaW50ZXJuYWwiLCJwYWRkaW5nIiwiT2JqZWN0Iiwia2V5cyIsImVudHJpZXMiLCJhdHRhY2htZW50cyIsIkJhZGdlIiwic2l6ZSIsImFsaWduIiwidGh1bWJuYWlsUGF0aCIsInNyYyIsImFsdCIsIm9iamVjdEZpdCIsImJvcmRlclJhZGl1cyIsImZvbnR3ZWlnaHQiLCJDaGVja0JveCIsImNoZWNrZWQiLCJkaXNhYmxlZCIsIm9uQ2xpY2siLCJQYXNzd29yZEVkaXQiLCJwcm9wcyIsInByb3BlcnR5IiwicmVjb3JkIiwicmVzb3VyY2UiLCJ0cmFuc2xhdGVCdXR0b24iLCJ0YiIsInVzZVRyYW5zbGF0aW9uIiwic2hvd1Bhc3N3b3JkIiwidG9nZ2xlUGFzc3dvcmQiLCJCYXNlUHJvcGVydHlDb21wb25lbnQiLCJQYXNzd29yZCIsIkVkaXQiLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiLCJQaWN0dXJlU2VsZWN0b3IiLCJQYXNzd29yZEVkaXRDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFBQTtFQVlBLE1BQU1BLEtBQUssR0FBR0EsTUFBTTtJQUNsQixNQUFNLENBQUNDLE1BQU0sRUFBRUMsU0FBUyxDQUFDLEdBQUdDLGNBQVEsQ0FBUSxFQUFFLENBQUM7SUFDL0MsTUFBTSxDQUFDQyxhQUFhLEVBQUVDLFFBQVEsQ0FBQyxHQUFHRixjQUFRLENBQU0sSUFBSSxDQUFDO0lBQ3JELE1BQU0sQ0FBQ0csU0FBUyxFQUFFQyxZQUFZLENBQUMsR0FBR0osY0FBUSxDQUFDLElBQUksQ0FBQztFQUVoREssRUFBQUEsZUFBUyxDQUFDLE1BQU07RUFDZCxJQUFBLE1BQU1DLFdBQVcsR0FBRyxZQUFZO1FBQzlCLElBQUk7RUFDRixRQUFBLE1BQU1DLFFBQVEsR0FBRyxNQUFNQyxLQUFLLENBQUMsYUFBYSxDQUFDO0VBQzNDLFFBQUEsTUFBTUMsSUFBSSxHQUFHLE1BQU1GLFFBQVEsQ0FBQ0csSUFBSSxFQUFFO1VBQ2xDWCxTQUFTLENBQUNVLElBQUksQ0FBQztFQUNmO1VBQ0EsTUFBTUUsWUFBWSxHQUFHRixJQUFJLENBQUNHLElBQUksQ0FBRUMsQ0FBTSxJQUFLQSxDQUFDLENBQUNDLFNBQVMsQ0FBQztFQUN2RFosUUFBQUEsUUFBUSxDQUFDUyxZQUFZLElBQUlGLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsT0FBT00sS0FBSyxFQUFFO0VBQ2RDLFFBQUFBLE9BQU8sQ0FBQ0QsS0FBSyxDQUFDLHlCQUF5QixFQUFFQSxLQUFLLENBQUM7VUFDL0NoQixTQUFTLENBQUMsRUFBRSxDQUFDO0VBQ2YsTUFBQSxDQUFDLFNBQVM7VUFDUkssWUFBWSxDQUFDLEtBQUssQ0FBQztFQUNyQixNQUFBO01BQ0YsQ0FBQztFQUNERSxJQUFBQSxXQUFXLEVBQUU7SUFDZixDQUFDLEVBQUUsRUFBRSxDQUFDO0VBRU4sRUFBQSxvQkFDRVcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQ0ZDLElBQUFBLE1BQU0sRUFBQyxNQUFNO0VBQ2JDLElBQUFBLE1BQU0sRUFBQyxPQUFPO0VBQ2RDLElBQUFBLE9BQU8sRUFBQyxNQUFNO0VBQ2RDLElBQUFBLGFBQWEsRUFBQyxRQUFRO0VBQ3RCQyxJQUFBQSxVQUFVLEVBQUMsUUFBUTtFQUNuQkMsSUFBQUEsY0FBYyxFQUFDLFFBQVE7RUFDdkJDLElBQUFBLE1BQU0sRUFBQyxNQUFNO0VBQUNDLElBQUFBLEVBQUUsRUFBQztLQUFNLGVBRXZCVixzQkFBQSxDQUFBQyxhQUFBLENBQUNVLGVBQUUsRUFBQSxJQUFBLEVBQUMsT0FBUyxDQUFDLGVBQ2RYLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxTQUFBLEVBQUE7RUFBU1csSUFBQUEsS0FBSyxFQUFFO0VBQUVDLE1BQUFBLEtBQUssRUFBRTtFQUFRO0VBQUUsR0FBQSxlQUNqQ2Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDYSxzQkFBUyxFQUFBO0VBQUNDLElBQUFBLE1BQU0sRUFBQztFQUFPLEdBQUEsZUFDdkJmLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2Usa0JBQUssRUFBQTtFQUFDQyxJQUFBQSxPQUFPLEVBQUM7RUFBTyxHQUFBLEVBQUMsU0FBYyxDQUFDLGVBQ3RDakIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUIsa0JBQUssRUFBQTtFQUFDQyxJQUFBQSxJQUFJLEVBQUMsT0FBTztFQUFDQyxJQUFBQSxJQUFJLEVBQUMsTUFBTTtFQUFDQyxJQUFBQSxPQUFPLEVBQUM7RUFBUyxHQUFFLENBQUMsZUFDcERyQixzQkFBQSxDQUFBQyxhQUFBLENBQUNlLGtCQUFLLEVBQUE7RUFBQ0MsSUFBQUEsT0FBTyxFQUFDO0VBQVUsR0FBQSxFQUFDLFVBQWUsQ0FBQyxlQUMxQ2pCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lCLGtCQUFLLEVBQUE7RUFBQ0MsSUFBQUEsSUFBSSxFQUFDLFVBQVU7RUFBQ0MsSUFBQUEsSUFBSSxFQUFDLFVBQVU7RUFBQ0MsSUFBQUEsT0FBTyxFQUFDO0VBQVMsR0FBRSxDQUFDLGVBQzNEckIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDZSxrQkFBSyxFQUFBO0VBQUNDLElBQUFBLE9BQU8sRUFBQztFQUFPLEdBQUEsRUFBQyxPQUFZLENBQUMsZUFDcENqQixzQkFBQSxDQUFBQyxhQUFBLENBQUNpQixrQkFBSyxFQUFBO0VBQUNFLElBQUFBLElBQUksRUFBQyxRQUFRO0VBQUNELElBQUFBLElBQUksRUFBQyxPQUFPO01BQUNHLEtBQUssRUFBRXRDLGFBQWEsRUFBRXNDO0VBQU0sR0FBRSxDQUFDLGVBQ2pFdEIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDc0IsbUJBQU0sRUFBQTtFQUNMRixJQUFBQSxPQUFPLEVBQUMsU0FBUztFQUNqQkcsSUFBQUEsT0FBTyxFQUFFM0MsTUFBTztFQUNoQnlDLElBQUFBLEtBQUssRUFBRXRDLGFBQWM7RUFDckJ5QyxJQUFBQSxRQUFRLEVBQUV4QyxRQUFTO0VBQ25CQyxJQUFBQSxTQUFTLEVBQUVBLFNBQVU7RUFDckJ3QyxJQUFBQSxVQUFVLEVBQUV4QyxTQUFTLElBQUlMLE1BQU0sQ0FBQzhDLE1BQU0sS0FBSztFQUFFLEdBQzlDLENBQ1EsQ0FBQyxlQUNaM0Isc0JBQUEsQ0FBQUMsYUFBQSxDQUFDMkIsbUJBQU0sRUFBQTtFQUFDUCxJQUFBQSxPQUFPLEVBQUMsU0FBUztFQUFDRCxJQUFBQSxJQUFJLEVBQUM7S0FBUSxFQUFDLE9BQWEsQ0FDOUMsQ0FDTixDQUFDO0VBRVYsQ0FBQzs7RUNuREQsTUFBTVMsR0FBRyxHQUFHLElBQUlDLGlCQUFTLEVBQUU7O0VBRzNCOztFQUtBLE1BQU1DLGdCQUFnQixHQUFHLEdBQUc7RUFDNUIsTUFBTUMsa0JBQWtCLEdBQUcsRUFBRTtFQUM3QixNQUFNQyxrQkFBa0IsR0FBRyxHQUFHO0VBRTlCLE1BQU1ULE9BQW1DLEdBQUc7RUFDeENVLEVBQUFBLElBQUksRUFBRSxTQUFTO0VBQ2ZDLEVBQUFBLEtBQUssRUFBRSxTQUFTO0VBQ2hCQyxFQUFBQSxHQUFHLEVBQUU7RUFDVCxDQUFDO0VBRU0sTUFBTUMsZUFBeUIsR0FBR0EsTUFBTTtJQUMzQyxNQUFNLENBQUM3QyxJQUFJLEVBQUU4QyxPQUFPLENBQUMsR0FBR3ZELGNBQVEsQ0FBb0IsRUFBdUIsQ0FBQztFQUU1RUssRUFBQUEsZUFBUyxDQUFDLE1BQU07TUFDWixJQUFJbUQsWUFBWSxHQUFHLElBQUk7TUFDdkJWLEdBQUcsQ0FBQ1csWUFBWSxFQUFFLENBQUNDLElBQUksQ0FBRW5ELFFBQVEsSUFBSztFQUNsQ1MsTUFBQUEsT0FBTyxDQUFDMkMsR0FBRyxDQUFDLGtCQUFrQixFQUFFcEQsUUFBUSxDQUFDO0VBQ3pDLE1BQUEsSUFBSWlELFlBQVksRUFBRTtFQUNkRCxRQUFBQSxPQUFPLENBQUNoRCxRQUFRLENBQUNFLElBQXlCLENBQUM7RUFDL0MsTUFBQTtFQUNKLElBQUEsQ0FBQyxDQUFDO0VBQ0YsSUFBQSxPQUFPLE1BQU07RUFDVCtDLE1BQUFBLFlBQVksR0FBRyxLQUFLO01BQ3hCLENBQUM7SUFDTCxDQUFDLEVBQUUsRUFBRSxDQUFDO0VBRU4sRUFBQSxvQkFDSXZDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDeUMsSUFBQUEsUUFBUSxFQUFDLFVBQVU7RUFBQ0MsSUFBQUEsUUFBUSxFQUFDO0VBQVEsR0FBQSxlQUN0QzVDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUNBMkMsSUFBQUEsRUFBRSxFQUFDLFNBQVM7RUFDWnpDLElBQUFBLE1BQU0sRUFBRTJCLGdCQUFpQjtFQUN6QmUsSUFBQUEsRUFBRSxFQUFFZCxrQkFBbUI7RUFDdkJlLElBQUFBLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUVkLGtCQUFrQjtFQUFFLEdBQUEsZUFFMUNqQyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQzhDLElBQUFBLFNBQVMsRUFBQyxRQUFRO0VBQUNDLElBQUFBLEtBQUssRUFBQztLQUFPLGVBQ2pDakQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJVyxJQUFBQSxLQUFLLEVBQUU7RUFBRXNDLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLFVBQVUsRUFBRSxNQUFNO0VBQUVoRCxNQUFBQSxNQUFNLEVBQUU7RUFBUztLQUFFLEVBQ2pFWCxJQUFJLENBQUM0RCxXQUNOLENBQUMsZUFDTHBELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29ELGlCQUFJLEVBQUEsSUFBQSxFQUFDLGdCQUFjLEVBQUMsR0FBRyxFQUNuQjdELElBQUksQ0FBQzhELGlCQUFpQixLQUFLQyxTQUFTLEdBQy9CLElBQUlDLElBQUksQ0FBQ0MsY0FBYyxDQUFDLE9BQU8sRUFBRWpDLE9BQU8sQ0FBQyxDQUFDa0MsTUFBTSxDQUFDLElBQUlDLElBQUksQ0FBQ25FLElBQUksQ0FBQzhELGlCQUFpQixDQUFDLENBQUMsR0FDbEYsVUFDSixDQUFDLGVBQ1B0RCxzQkFBQSxDQUFBQyxhQUFBLENBQUNvRCxpQkFBSSxFQUFBLElBQUEsRUFBRTdELElBQUksQ0FBQ29FLGNBQWMsRUFBQyxpQkFBcUIsQ0FDL0MsQ0FDSixDQUNKLENBQUM7RUFFZCxDQUFDOztFQTRCRDtFQUNBLE1BQU1DLElBQUksR0FBR0MsdUJBQU0sQ0FBQzVELGdCQUFHLENBQWE7QUFDcEMsV0FBQSxFQUFhLENBQUM7QUFBRTZELEVBQUFBO0FBQUssQ0FBQyxLQUFjQSxJQUFJLEdBQUcsTUFBTSxHQUFHLE9BQVEsQ0FBQTtBQUM1RCxTQUFBLEVBQVcsQ0FBQztBQUFFQyxFQUFBQTtBQUFNLENBQUMsS0FBS0EsS0FBSyxDQUFDQyxNQUFNLENBQUNDLE9BQU8sQ0FBQTtBQUM5QztBQUNBO0FBQ0E7QUFDQSxpQkFBQSxFQUFtQixDQUFDO0FBQUVGLEVBQUFBO0FBQU0sQ0FBQyxLQUFLQSxLQUFLLENBQUNHLEtBQUssQ0FBQ0MsRUFBRSxDQUFBO0FBQ2hEOztBQUVBO0FBQ0Esc0JBQUEsRUFBd0IsQ0FBQztBQUFFSixFQUFBQTtBQUFNLENBQUMsS0FBS0EsS0FBSyxDQUFDQyxNQUFNLENBQUNJLFNBQVMsQ0FBQTtBQUM3RCxnQkFBQSxFQUFrQixDQUFDO0FBQUVMLEVBQUFBO0FBQU0sQ0FBQyxLQUFLQSxLQUFLLENBQUNNLE9BQU8sQ0FBQ0MsU0FBUyxDQUFBO0FBQ3hEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztFQUVEVixJQUFJLENBQUNXLFlBQVksR0FBRztFQUNoQm5ELEVBQUFBLE9BQU8sRUFBRSxXQUFXO0VBQ3BCb0QsRUFBQUEsU0FBUyxFQUFFO0VBQ2YsQ0FBQztFQUVNLE1BQU1DLFNBQW1CLEdBQUdBLE1BQU07SUFDckMsTUFBTSxDQUFDbEYsSUFBSSxFQUFFOEMsT0FBTyxDQUFDLEdBQUd2RCxjQUFRLENBQW9CLEVBQXVCLENBQUM7RUFFNUVLLEVBQUFBLGVBQVMsQ0FBQyxNQUFNO01BQ1osSUFBSW1ELFlBQVksR0FBRyxJQUFJO01BQ3ZCVixHQUFHLENBQUNXLFlBQVksRUFBRSxDQUFDQyxJQUFJLENBQUVuRCxRQUFRLElBQUs7RUFDbEMsTUFBQSxJQUFJaUQsWUFBWSxFQUFFO0VBQ2RELFFBQUFBLE9BQU8sQ0FBQ2hELFFBQVEsQ0FBQ0UsSUFBeUIsQ0FBQztFQUMvQyxNQUFBO0VBQ0osSUFBQSxDQUFDLENBQUM7RUFDRixJQUFBLE9BQU8sTUFBTTtFQUNUK0MsTUFBQUEsWUFBWSxHQUFHLEtBQUs7TUFDeEIsQ0FBQztJQUNMLENBQUMsRUFBRSxFQUFFLENBQUM7RUFFTixFQUFBLG9CQUNJdkMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBLElBQUEsZUFDQUYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDb0MsZUFBZSxNQUFFLENBQUMsZUFDbkJyQyxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFDQXlFLElBQUFBLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFFO0VBQzNCQyxJQUFBQSxFQUFFLEVBQUMsSUFBSTtNQUNQQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUU7TUFDdEI5QixFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUU7RUFDbENKLElBQUFBLFFBQVEsRUFBQyxVQUFVO01BQ25Cb0IsSUFBSSxFQUFBLElBQUE7RUFDSnpELElBQUFBLGFBQWEsRUFBQyxLQUFLO0VBQ25Cd0UsSUFBQUEsUUFBUSxFQUFDLE1BQU07RUFDZnRFLElBQUFBLGNBQWMsRUFBQyxlQUFlO0VBQzlCdUUsSUFBQUEsWUFBWSxFQUFDLFlBQVk7TUFDekJsRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJO0VBQUUsR0FBQSxlQUd2QmIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNXLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBRTtFQUFDbUUsSUFBQUEsQ0FBQyxFQUFDO0VBQUksR0FBQSxlQUM3QmhGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzRELElBQUksRUFBQTtFQUFDbkQsSUFBQUEsRUFBRSxFQUFDLEdBQUc7TUFBQ3FELElBQUksRUFBQTtFQUFBLEdBQUEsZUFDYi9ELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDK0UsSUFBQUEsRUFBRSxFQUFDO0VBQUksR0FBQSxlQUNSakYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUYsZUFBRSxFQUFBLElBQUEsRUFBQyxzQkFBd0IsQ0FBQyxlQUM3QmxGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxlQUNJRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBS1QsSUFBSSxDQUFDMkYsYUFBYSxJQUFJLENBQUMsRUFBQyx3QkFBMEIsQ0FBQyxlQUN4RG5GLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFLVCxJQUFJLENBQUM0RixvQkFBb0IsSUFBSSxDQUFDLEVBQUMsd0JBQTBCLENBQUMsZUFDL0RwRixzQkFBQSxDQUFBQyxhQUFBLGFBQUtULElBQUksQ0FBQzZGLFlBQVksSUFBSSxDQUFDLEVBQUMsa0JBQW9CLENBQUMsZUFDakRyRixzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBS1QsSUFBSSxDQUFDOEYsb0JBQW9CLElBQUksQ0FBQyxFQUFDLGtCQUFvQixDQUN4RCxDQUNILENBQ0gsQ0FDTCxDQUFDLGVBR050RixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQ1csS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFFO0VBQUNtRSxJQUFBQSxDQUFDLEVBQUM7RUFBSSxHQUFBLGVBQzdCaEYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDNEQsSUFBSSxFQUFBO0VBQUNuRCxJQUFBQSxFQUFFLEVBQUMsR0FBRztNQUFDcUQsSUFBSSxFQUFBO0VBQUEsR0FBQSxlQUNiL0Qsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUMrRSxJQUFBQSxFQUFFLEVBQUM7S0FBSSxlQUNSakYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDaUYsZUFBRSxFQUFBLElBQUEsRUFBQyxpQkFBbUIsQ0FBQyxlQUN4QmxGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxlQUNJRCxzQkFBQSxDQUFBQyxhQUFBLGFBQ0tULElBQUksQ0FBQytGLGNBQWMsSUFBSSxDQUFDLEVBQUMsR0FBQyxFQUFDL0YsSUFBSSxDQUFDZ0csZUFBZSxJQUFJLENBQUMsRUFBQyw0QkFBMEIsRUFBQyxHQUFHLEVBQ25GaEcsSUFBSSxDQUFDaUcsa0JBQWtCLElBQUksQ0FBQyxFQUFDLGVBQzlCLENBQUMsZUFDTHpGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUNNLENBQUNULElBQUksQ0FBQ2tHLFdBQVcsSUFBSSxDQUFDLEtBQUtsRyxJQUFJLENBQUNpRyxrQkFBa0IsSUFBSSxDQUFDLENBQUMsSUFBSWpHLElBQUksQ0FBQytGLGNBQWMsSUFBSSxDQUFDLENBQUMsRUFBRSwwQkFDekYsQ0FBQyxlQUNMdkYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUtULElBQUksQ0FBQ21HLFlBQVksSUFBSSxDQUFDLEVBQUMsdUNBQXlDLENBQ3JFLENBQ0gsQ0FDSCxDQUNMLENBQUMsZUFHTjNGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDVyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUU7RUFBQ21FLElBQUFBLENBQUMsRUFBQztFQUFJLEdBQUEsZUFDN0JoRixzQkFBQSxDQUFBQyxhQUFBLENBQUM0RCxJQUFJLEVBQUE7RUFBQ25ELElBQUFBLEVBQUUsRUFBQyxHQUFHO01BQUNxRCxJQUFJLEVBQUE7RUFBQSxHQUFBLGVBQ2IvRCxzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQytFLElBQUFBLEVBQUUsRUFBQztLQUFJLGVBQ1JqRixzQkFBQSxDQUFBQyxhQUFBLENBQUNpRixlQUFFLEVBQUEsSUFBQSxFQUFDLDBCQUF3QixFQUFDMUYsSUFBSSxDQUFDa0csV0FBVyxJQUFJLENBQUMsRUFBQyxHQUFLLENBQUMsZUFDekQxRixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7TUFBQzZELElBQUksRUFBQSxJQUFBO0VBQUN6RCxJQUFBQSxhQUFhLEVBQUMsS0FBSztFQUFDRSxJQUFBQSxjQUFjLEVBQUMsZUFBZTtFQUFDbUMsSUFBQUEsUUFBUSxFQUFDO0VBQVUsR0FBQSxlQUM1RTNDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtNQUFDVyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO0tBQUUsZUFDdEJiLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzJGLGVBQUUsRUFBQSxJQUFBLEVBQUMsV0FBYSxDQUFDLGVBQ2xCNUYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQSxJQUFBLGVBQ0lELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFLVCxJQUFJLENBQUNxRyxRQUFRLElBQUksQ0FBQyxFQUFDLEtBQU8sQ0FBQyxlQUNoQzdGLHNCQUFBLENBQUFDLGFBQUEsYUFBS1QsSUFBSSxDQUFDc0csUUFBUSxJQUFJLENBQUMsRUFBQyxLQUFPLENBQUMsZUFDaEM5RixzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBS1QsSUFBSSxDQUFDdUcsUUFBUSxJQUFJLENBQUMsRUFBQyxLQUFPLENBQy9CLENBQ0gsQ0FBQyxlQUNOL0Ysc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO01BQUNXLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFBRSxHQUFBLGVBQ3RCYixzQkFBQSxDQUFBQyxhQUFBLENBQUMyRixlQUFFLEVBQUEsSUFBQSxFQUFDLEtBQU8sQ0FBQyxlQUNaNUYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQSxJQUFBLGVBQ0lELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFLVCxJQUFJLENBQUN3RyxhQUFhLElBQUksQ0FBQyxFQUFDLFVBQVksQ0FBQyxlQUMxQ2hHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFLVCxJQUFJLENBQUN5RyxXQUFXLElBQUksQ0FBQyxFQUFDLFFBQVUsQ0FBQyxlQUN0Q2pHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFLVCxJQUFJLENBQUMwRyxPQUFPLElBQUksQ0FBQyxFQUFDLElBQU0sQ0FDN0IsQ0FDSCxDQUNKLENBQ0osQ0FDSCxDQUNMLENBQUMsZUFHTmxHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDVyxJQUFBQSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRTtFQUFDbUUsSUFBQUEsQ0FBQyxFQUFDO0VBQUksR0FBQSxlQUN6QmhGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzRELElBQUksRUFBQTtFQUFDbkQsSUFBQUEsRUFBRSxFQUFDLEdBQUc7TUFBQ3FELElBQUksRUFBQTtFQUFBLEdBQUEsZUFDYi9ELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDK0UsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ3BFLElBQUFBLEtBQUssRUFBQztFQUFNLEdBQUEsZUFDckJiLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lGLGVBQUUsUUFBQyx1QkFBeUIsQ0FBQyxlQUM5QmxGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2tHLGtCQUFLLEVBQUEsSUFBQSxlQUNGbkcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDbUcsc0JBQVMscUJBQ05wRyxzQkFBQSxDQUFBQyxhQUFBLENBQUNvRyxxQkFBUSxFQUFBLElBQUEsZUFDTHJHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FHLHNCQUFTLEVBQUEsSUFBQSxFQUFDLE9BQWdCLENBQUMsZUFDNUJ0RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNxRyxzQkFBUyxRQUFDLE9BQWdCLENBQUMsZUFDNUJ0RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNxRyxzQkFBUyxFQUFBLElBQUEsRUFBQyxhQUFzQixDQUMzQixDQUNILENBQUMsZUFDWnRHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3NHLHNCQUFTLFFBQ0wvRyxJQUFJLENBQUNnSCxTQUFTLElBQUloSCxJQUFJLENBQUNnSCxTQUFTLENBQUNDLEdBQUcsQ0FBRUMsUUFBUSxpQkFDM0MxRyxzQkFBQSxDQUFBQyxhQUFBLENBQUNvRyxxQkFBUSxFQUFBO01BQUNNLEdBQUcsRUFBRUQsUUFBUSxDQUFDRTtLQUFHLGVBQ3ZCNUcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUcsc0JBQVMsRUFBQSxJQUFBLEVBQUVJLFFBQVEsQ0FBQ0csS0FBaUIsQ0FBQyxlQUN2QzdHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FHLHNCQUFTLFFBQUVJLFFBQVEsQ0FBQ0ksS0FBaUIsQ0FBQyxlQUN2QzlHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FHLHNCQUFTLEVBQUEsSUFBQSxFQUFFSSxRQUFRLENBQUNLLFdBQXVCLENBQ3RDLENBQ2IsQ0FDTSxDQUNSLENBQ04sQ0FDSCxDQUNMLENBQUMsZUFHTi9HLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDVyxJQUFBQSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRTtFQUFDbUUsSUFBQUEsQ0FBQyxFQUFDO0VBQUksR0FBQSxlQUN6QmhGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzRELElBQUksRUFBQTtFQUFDbkQsSUFBQUEsRUFBRSxFQUFDLEdBQUc7TUFBQ3FELElBQUksRUFBQTtFQUFBLEdBQUEsZUFDYi9ELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDK0UsSUFBQUEsRUFBRSxFQUFDLElBQUk7RUFBQ3BFLElBQUFBLEtBQUssRUFBQztFQUFNLEdBQUEsZUFDckJiLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2lGLGVBQUUsUUFBQyxxQkFBdUIsQ0FBQyxlQUM1QmxGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ2tHLGtCQUFLLEVBQUEsSUFBQSxlQUNGbkcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDbUcsc0JBQVMscUJBQ05wRyxzQkFBQSxDQUFBQyxhQUFBLENBQUNvRyxxQkFBUSxFQUFBLElBQUEsZUFDTHJHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FHLHNCQUFTLEVBQUEsSUFBQSxFQUFDLE9BQWdCLENBQUMsZUFDNUJ0RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNxRyxzQkFBUyxRQUFDLE9BQWdCLENBQUMsZUFDNUJ0RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNxRyxzQkFBUyxFQUFBLElBQUEsRUFBQyxhQUFzQixDQUMzQixDQUNILENBQUMsZUFDWnRHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3NHLHNCQUFTLFFBQ0wvRyxJQUFJLENBQUN3SCxPQUFPLElBQ1R4SCxJQUFJLENBQUN3SCxPQUFPLENBQUNQLEdBQUcsQ0FBRVEsTUFBTSxpQkFDcEJqSCxzQkFBQSxDQUFBQyxhQUFBLENBQUNvRyxxQkFBUSxFQUFBO01BQUNNLEdBQUcsRUFBRU0sTUFBTSxDQUFDTDtFQUFHLEdBQUEsZUFDckI1RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNxRyxzQkFBUyxFQUFBLElBQUEsRUFBRVcsTUFBTSxDQUFDSixLQUFpQixDQUFDLGVBQ3JDN0csc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUcsc0JBQVMsRUFBQSxJQUFBLEVBQUVXLE1BQU0sQ0FBQ0gsS0FBaUIsQ0FBQyxlQUNyQzlHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FHLHNCQUFTLEVBQUEsSUFBQSxFQUFFVyxNQUFNLENBQUNGLFdBQXVCLENBQ3BDLENBQ2IsQ0FDRSxDQUNSLENBQ04sQ0FDSCxDQUNMLENBQ0osQ0FDSixDQUFDO0VBRWQsQ0FBQzs7RUNsUU0sTUFBTUcsa0JBQTRCLEdBQUdBLE1BQU07SUFDOUMsTUFBTSxDQUFDMUgsSUFBSSxFQUFFOEMsT0FBTyxDQUFDLEdBQUd2RCxjQUFRLENBQXFCLEVBQUUsQ0FBQztJQUN4RCxNQUFNLENBQUNvSSxPQUFPLEVBQUVDLFVBQVUsQ0FBQyxHQUFHckksY0FBUSxDQUFVLElBQUksQ0FBQztJQUNyRCxNQUFNLENBQUNzSSxRQUFRLEVBQUVDLFdBQVcsQ0FBQyxHQUFHdkksY0FBUSxDQUFnQixJQUFJLENBQUM7RUFFN0QsRUFBQSxNQUFNOEMsR0FBRyxHQUFHLElBQUlDLGlCQUFTLEVBQUU7RUFFM0IsRUFBQSxNQUFNeUYsU0FBUyxHQUFHLFlBQVk7TUFDMUJILFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFDaEIsSUFBSTtFQUNBLE1BQUEsTUFBTTlILFFBQVEsR0FBRyxNQUFNdUMsR0FBRyxDQUFDMkYsT0FBTyxDQUFDO0VBQUVDLFFBQUFBLFFBQVEsRUFBRTtFQUFrQixPQUFDLENBQUM7RUFDbkVuRixNQUFBQSxPQUFPLENBQUNoRCxRQUFRLENBQUNFLElBQTBCLENBQUM7TUFFaEQsQ0FBQyxDQUFDLE9BQU9rSSxHQUFHLEVBQUU7RUFDVjNILE1BQUFBLE9BQU8sQ0FBQ0QsS0FBSyxDQUFDLDZCQUE2QixFQUFFNEgsR0FBRyxDQUFDO0VBRXJELElBQUEsQ0FBQyxTQUFTO1FBQ05OLFVBQVUsQ0FBQyxLQUFLLENBQUM7RUFDckIsSUFBQTtJQUNKLENBQUM7RUFFRGhJLEVBQUFBLGVBQVMsQ0FBQyxNQUFNO0VBQ1ptSSxJQUFBQSxTQUFTLEVBQUU7SUFDZixDQUFDLEVBQUUsRUFBRSxDQUFDOztFQUVOO0lBQ0EsTUFBTUksWUFBWSxHQUFHQSxDQUFDQyxXQUFtQixFQUFFaEIsRUFBVSxFQUFFaUIsS0FBK0IsS0FBSztNQUN2RnZGLE9BQU8sQ0FBRXdGLElBQUksSUFBSztFQUNkLE1BQUEsTUFBTUMsWUFBWSxHQUFHRCxJQUFJLENBQUNGLFdBQVcsQ0FBQyxDQUFDbkIsR0FBRyxDQUFFdUIsSUFBSSxJQUM1Q0EsSUFBSSxDQUFDcEIsRUFBRSxLQUFLQSxFQUFFLEdBQUc7RUFBRSxRQUFBLEdBQUdvQixJQUFJO0VBQUUsUUFBQSxDQUFDSCxLQUFLLEdBQUcsQ0FBQ0csSUFBSSxDQUFDSCxLQUFLO1NBQUcsR0FBR0csSUFDMUQsQ0FBQztRQUNELE9BQU87RUFBRSxRQUFBLEdBQUdGLElBQUk7RUFBRSxRQUFBLENBQUNGLFdBQVcsR0FBR0c7U0FBYztFQUNuRCxJQUFBLENBQUMsQ0FBQztJQUNOLENBQUM7O0VBRUQ7RUFDQSxFQUFBLE1BQU1FLFVBQVUsR0FBRyxNQUFPRCxJQUF1QixJQUFLO0VBQ2xEVixJQUFBQSxXQUFXLENBQUNVLElBQUksQ0FBQ3BCLEVBQUUsQ0FBQztNQUNwQixJQUFJO0VBQ0E7UUFDQSxNQUFNL0UsR0FBRyxDQUFDcUcsWUFBWSxDQUFDO0VBQ25CQyxRQUFBQSxVQUFVLEVBQUUsYUFBYTtFQUFFO0VBQzNCQyxRQUFBQSxVQUFVLEVBQUUsTUFBTTtFQUNsQkMsUUFBQUEsUUFBUSxFQUFFQyxNQUFNLENBQUNOLElBQUksQ0FBQ3BCLEVBQUUsQ0FBQztFQUN6QnBILFFBQUFBLElBQUksRUFBRTtZQUNGK0ksU0FBUyxFQUFFUCxJQUFJLENBQUNPLFNBQVM7WUFDekJDLFFBQVEsRUFBRVIsSUFBSSxDQUFDUTtFQUNuQjtFQUNKLE9BQUMsQ0FBQztNQUNOLENBQUMsQ0FBQyxPQUFPZCxHQUFHLEVBQUU7UUFDVjNILE9BQU8sQ0FBQ0QsS0FBSyxDQUFDLENBQUEsNEJBQUEsRUFBK0JrSSxJQUFJLENBQUNwQixFQUFFLENBQUEsQ0FBQSxDQUFHLEVBQUVjLEdBQUcsQ0FBQztFQUNqRSxJQUFBLENBQUMsU0FBUztRQUNOSixXQUFXLENBQUMsSUFBSSxDQUFDO0VBQ3JCLElBQUE7SUFDSixDQUFDO0VBRUQsRUFBQSxJQUFJSCxPQUFPLEVBQUU7RUFDVCxJQUFBLG9CQUFPbkgsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDQyxnQkFBRyxFQUFBO0VBQUN1SSxNQUFBQSxPQUFPLEVBQUM7T0FBSSxlQUFDekksc0JBQUEsQ0FBQUMsYUFBQSxDQUFDb0QsaUJBQUksRUFBQSxJQUFBLEVBQUMsdUJBQTJCLENBQU0sQ0FBQztFQUNyRSxFQUFBO0VBRUEsRUFBQSxvQkFDSXJELHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDdUksSUFBQUEsT0FBTyxFQUFDO0VBQUksR0FBQSxlQUNiekksc0JBQUEsQ0FBQUMsYUFBQSxDQUFDb0QsaUJBQUksRUFBQTtFQUFDaEMsSUFBQUEsT0FBTyxFQUFDLElBQUk7RUFBQ3VELElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsRUFBQyw4QkFBa0MsQ0FBQyxFQUU3RDhELE1BQU0sQ0FBQ0MsSUFBSSxDQUFDbkosSUFBSSxDQUFDLENBQUNtQyxNQUFNLEtBQUssQ0FBQyxnQkFDM0IzQixzQkFBQSxDQUFBQyxhQUFBLENBQUNvRCxpQkFBSSxFQUFBLElBQUEsRUFBQyxzQ0FBMEMsQ0FBQyxHQUVqRHFGLE1BQU0sQ0FBQ0UsT0FBTyxDQUFDcEosSUFBSSxDQUFDLENBQUNpSCxHQUFHLENBQUMsQ0FBQyxDQUFDbUIsV0FBVyxFQUFFaUIsV0FBVyxDQUFDLGtCQUNoRDdJLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ0MsZ0JBQUcsRUFBQTtFQUFDeUcsSUFBQUEsR0FBRyxFQUFFaUIsV0FBWTtFQUFDaEQsSUFBQUEsRUFBRSxFQUFDLEtBQUs7RUFBQy9CLElBQUFBLEVBQUUsRUFBQyxPQUFPO0VBQUNtQyxJQUFBQSxDQUFDLEVBQUMsSUFBSTtFQUFDUCxJQUFBQSxTQUFTLEVBQUM7RUFBTSxHQUFBLGVBQzlEekUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDNkksa0JBQUssRUFBQTtFQUFDekgsSUFBQUEsT0FBTyxFQUFDLFNBQVM7RUFBQzBILElBQUFBLElBQUksRUFBQyxJQUFJO0VBQUNuRSxJQUFBQSxFQUFFLEVBQUM7RUFBSSxHQUFBLEVBQ3JDZ0QsV0FDRSxDQUFDLGVBRVI1SCxzQkFBQSxDQUFBQyxhQUFBLENBQUNrRyxrQkFBSyxFQUFBLElBQUEsZUFDRm5HLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ21HLHNCQUFTLEVBQUEsSUFBQSxlQUNOcEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDb0cscUJBQVEsRUFBQSxJQUFBLGVBQ0xyRyxzQkFBQSxDQUFBQyxhQUFBLENBQUNxRyxzQkFBUyxFQUFBLElBQUEsRUFBQyxXQUFvQixDQUFDLGVBQ2hDdEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUcsc0JBQVMsRUFBQSxJQUFBLEVBQUMsTUFBZSxDQUFDLGVBQzNCdEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUcsc0JBQVMsRUFBQTtFQUFDMEMsSUFBQUEsS0FBSyxFQUFDO0VBQVEsR0FBQSxFQUFDLFVBQW1CLENBQUMsZUFDOUNoSixzQkFBQSxDQUFBQyxhQUFBLENBQUNxRyxzQkFBUyxFQUFBO0VBQUMwQyxJQUFBQSxLQUFLLEVBQUM7RUFBUSxHQUFBLEVBQUMsV0FBb0IsQ0FBQyxlQUMvQ2hKLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FHLHNCQUFTLEVBQUE7RUFBQzBDLElBQUFBLEtBQUssRUFBQztLQUFPLEVBQUMsU0FBa0IsQ0FDckMsQ0FDSCxDQUFDLGVBQ1poSixzQkFBQSxDQUFBQyxhQUFBLENBQUNzRyxzQkFBUyxRQUNMc0MsV0FBVyxDQUFDcEMsR0FBRyxDQUFFdUIsSUFBSSxpQkFDbEJoSSxzQkFBQSxDQUFBQyxhQUFBLENBQUNvRyxxQkFBUSxFQUFBO01BQUNNLEdBQUcsRUFBRXFCLElBQUksQ0FBQ3BCO0VBQUcsR0FBQSxlQUNuQjVHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FHLHNCQUFTLEVBQUE7RUFBQzFGLElBQUFBLEtBQUssRUFBRTtFQUFFQyxNQUFBQSxLQUFLLEVBQUU7RUFBUTtFQUFFLEdBQUEsRUFDaENtSCxJQUFJLENBQUNpQixhQUFhLGdCQUNmakosc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtNQUNJaUosR0FBRyxFQUFFbEIsSUFBSSxDQUFDaUIsYUFBYztNQUN4QkUsR0FBRyxFQUFFbkIsSUFBSSxDQUFDN0csSUFBSztFQUNmUCxJQUFBQSxLQUFLLEVBQUU7RUFBRUMsTUFBQUEsS0FBSyxFQUFFLE1BQU07RUFBRVQsTUFBQUEsTUFBTSxFQUFFLE1BQU07RUFBRWdKLE1BQUFBLFNBQVMsRUFBRSxPQUFPO0VBQUVDLE1BQUFBLFlBQVksRUFBRTtFQUFNO0VBQUUsR0FDckYsQ0FBQyxnQkFFRnJKLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29ELGlCQUFJLEVBQUE7RUFBQ0osSUFBQUEsS0FBSyxFQUFDO0VBQVEsR0FBQSxFQUFDLFVBQWMsQ0FFaEMsQ0FBQyxlQUVaakQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUcsc0JBQVMsRUFBQSxJQUFBLGVBQ050RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNvRCxpQkFBSSxFQUFBO0VBQUNpRyxJQUFBQSxVQUFVLEVBQUM7S0FBTSxFQUFFdEIsSUFBSSxDQUFDN0csSUFBVyxDQUNsQyxDQUFDLGVBRVpuQixzQkFBQSxDQUFBQyxhQUFBLENBQUNxRyxzQkFBUyxFQUFBO0VBQUMwQyxJQUFBQSxLQUFLLEVBQUM7RUFBUSxHQUFBLGVBQ3JCaEosc0JBQUEsQ0FBQUMsYUFBQSxDQUFDc0oscUJBQVEsRUFBQTtNQUNMQyxPQUFPLEVBQUV4QixJQUFJLENBQUNRLFFBQVM7TUFDdkIvRyxRQUFRLEVBQUVBLE1BQU1rRyxZQUFZLENBQUNDLFdBQVcsRUFBRUksSUFBSSxDQUFDcEIsRUFBRSxFQUFFLFVBQVU7RUFBRSxHQUNsRSxDQUNNLENBQUMsZUFFWjVHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ3FHLHNCQUFTLEVBQUE7RUFBQzBDLElBQUFBLEtBQUssRUFBQztFQUFRLEdBQUEsZUFDckJoSixzQkFBQSxDQUFBQyxhQUFBLENBQUNzSixxQkFBUSxFQUFBO01BQ0xDLE9BQU8sRUFBRXhCLElBQUksQ0FBQ08sU0FBVTtNQUN4QjlHLFFBQVEsRUFBRUEsTUFBTWtHLFlBQVksQ0FBQ0MsV0FBVyxFQUFFSSxJQUFJLENBQUNwQixFQUFFLEVBQUUsV0FBVztFQUFFLEdBQ25FLENBQ00sQ0FBQyxlQUVaNUcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFDcUcsc0JBQVMsRUFBQTtFQUFDMEMsSUFBQUEsS0FBSyxFQUFDO0VBQU8sR0FBQSxlQUNwQmhKLHNCQUFBLENBQUFDLGFBQUEsQ0FBQzJCLG1CQUFNLEVBQUE7RUFDSG1ILElBQUFBLElBQUksRUFBQyxJQUFJO0VBQ1QxSCxJQUFBQSxPQUFPLEVBQUMsV0FBVztFQUNuQm9JLElBQUFBLFFBQVEsRUFBRXBDLFFBQVEsS0FBS1csSUFBSSxDQUFDcEIsRUFBRztFQUMvQjhDLElBQUFBLE9BQU8sRUFBRUEsTUFBTXpCLFVBQVUsQ0FBQ0QsSUFBSTtFQUFFLEdBQUEsRUFFL0JYLFFBQVEsS0FBS1csSUFBSSxDQUFDcEIsRUFBRSxHQUFHLFdBQVcsR0FBRyxZQUNsQyxDQUNELENBQ0wsQ0FDYixDQUNNLENBQ1IsQ0FDTixDQUNSLENBRUosQ0FBQztFQUVkLENBQUM7O0VDdEpELE1BQU0rQyxZQUFZLEdBQUlDLEtBQUssSUFBSztJQUM1QixNQUFNO01BQUVuSSxRQUFRO01BQUVvSSxRQUFRO01BQUVDLE1BQU07RUFBRUMsSUFBQUE7RUFBUyxHQUFDLEdBQUdILEtBQUs7SUFDdEQsTUFBTTtFQUFFSSxJQUFBQSxlQUFlLEVBQUVDO0tBQUksR0FBR0Msc0JBQWMsRUFBRTtJQUNoRCxNQUFNLENBQUNDLFlBQVksRUFBRUMsY0FBYyxDQUFDLEdBQUdyTCxjQUFRLENBQUMsS0FBSyxDQUFDO0VBQ3RESyxFQUFBQSxlQUFTLENBQUMsTUFBTTtNQUNaLElBQUksQ0FBQytLLFlBQVksRUFBRTtFQUNmMUksTUFBQUEsUUFBUSxDQUFDb0ksUUFBUSxDQUFDMUksSUFBSSxFQUFFLEVBQUUsQ0FBQztFQUMvQixJQUFBO0VBQ0osRUFBQSxDQUFDLEVBQUUsQ0FBQ00sUUFBUSxFQUFFMEksWUFBWSxDQUFDLENBQUM7RUFDNUI7RUFDQSxFQUFBLElBQUksQ0FBQ0wsTUFBTSxDQUFDbEQsRUFBRSxFQUFFO01BQ1osb0JBQU81RyxzQkFBQSxDQUFBQyxhQUFBLENBQUNvSyw2QkFBcUIsQ0FBQ0MsUUFBUSxDQUFDQyxJQUFJLEVBQUtYLEtBQU8sQ0FBQztFQUM1RCxFQUFBO0lBQ0Esb0JBQVE1SixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLFFBQ1RpSyxZQUFZLGlCQUFJbkssc0JBQUEsQ0FBQUMsYUFBQSxDQUFDb0ssNkJBQXFCLENBQUNDLFFBQVEsQ0FBQ0MsSUFBSSxFQUFLWCxLQUFPLENBQUMsZUFDbEU1SixzQkFBQSxDQUFBQyxhQUFBLENBQUNDLGdCQUFHLEVBQUE7RUFBQzBFLElBQUFBLEVBQUUsRUFBQztFQUFJLEdBQUEsZUFDVjVFLHNCQUFBLENBQUFDLGFBQUEsQ0FBQ29ELGlCQUFJLEVBQUE7RUFBQ0wsSUFBQUEsU0FBUyxFQUFDO0VBQVEsR0FBQSxlQUN0QmhELHNCQUFBLENBQUFDLGFBQUEsQ0FBQzJCLG1CQUFNLEVBQUE7RUFBQzhILElBQUFBLE9BQU8sRUFBRUEsTUFBTVUsY0FBYyxDQUFDLENBQUNELFlBQVksQ0FBRTtFQUFDL0ksSUFBQUEsSUFBSSxFQUFDO0tBQVEsRUFDaEUrSSxZQUFZLEdBQUdGLEVBQUUsQ0FBQyxRQUFRLEVBQUVGLFFBQVEsQ0FBQ25ELEVBQUUsQ0FBQyxHQUFHcUQsRUFBRSxDQUFDLGdCQUFnQixFQUFFRixRQUFRLENBQUNuRCxFQUFFLENBQ3RFLENBQ0osQ0FDSCxDQUNGLENBQUM7RUFDVixDQUFDOztFQzFCRDRELE9BQU8sQ0FBQ0MsY0FBYyxHQUFHLEVBQUU7RUFFM0JELE9BQU8sQ0FBQ0MsY0FBYyxDQUFDN0wsS0FBSyxHQUFHQSxLQUFLO0VBRXBDNEwsT0FBTyxDQUFDQyxjQUFjLENBQUMvRixTQUFTLEdBQUdBLFNBQVM7RUFFNUM4RixPQUFPLENBQUNDLGNBQWMsQ0FBQ0MsZUFBZSxHQUFHQSxrQkFBZTtFQUV4REYsT0FBTyxDQUFDQyxjQUFjLENBQUNFLHFCQUFxQixHQUFHQSxZQUFxQjs7Ozs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlszXX0=
